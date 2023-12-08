import { CallHandler, createParamDecorator, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, Type } from "@nestjs/common";
import { APP_INTERCEPTOR, ModuleRef } from "@nestjs/core";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { GraphQLRequestContext } from "apollo-server-core";
import * as DataLoader from "dataloader";
import { Observable } from "rxjs";

const NEST_LOADER_CONTEXT_KEY = 'NEST_LOADER_CONTEXT_KEY';

//요청마다 context에 dataloader를 설정하는 interceptor
@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
    constructor(
        private readonly moduleRef: ModuleRef,
    ) {}

    public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if(context.getType<GqlContextType>() !== 'graphql') {
            return next.handle();
        }

        const ctx = GqlExecutionContext.create(context).getContext();

        //dataloader가 설정되어있지 않을 경우
        if(ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
            const loaders = {};

            //context에 dataloader들 설정
            ctx[NEST_LOADER_CONTEXT_KEY] = {
                loaders,
                getLoader: (type: Type<NestDataLoaderFactory<any, any>>, _ctx: GraphQLRequestContext): Promise<NestDataLoaderFactory<any, any>> => {
                    const name = type.name.replace('Factory', '');

                    if (loaders[name] === undefined) {
                        loaders[name] = (async () => {
                            try {
                                return this.moduleRef.get(type, {strict: false}).generateDataLoader(_ctx);
                            } catch (e) {
                                throw new InternalServerErrorException(`The loader ${type.name} is not provided` + e);
                            }
                        })();
                    }

                    return loaders[name];
                },
            };
        }

        return next.handle();
    }
}

//context에 설정된 dataloader를 가져오는 데코레이터
export const Loader = createParamDecorator(
    (type: Type<NestDataLoaderFactory<any, any>>, context: ExecutionContext) => {
        const name = type?.name;

        if (!name) {
            throw new InternalServerErrorException(`Invalid name provider to @Loader ('${name}')`);
        }
    
        if (context.getType<GqlContextType>() !== 'graphql') {
            throw new InternalServerErrorException('@Loader should only be used within the GraphQL context');
        }
    
        const ctx = GqlExecutionContext.create(context).getContext();
        if (!name || !ctx[NEST_LOADER_CONTEXT_KEY]) {
            throw new InternalServerErrorException(`You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}`);
        }

        return ctx[NEST_LOADER_CONTEXT_KEY].getLoader(type, ctx);
    }
);

export const ensureOrder = <ID, Type>({docs, keys, propertyKey: propertyKey = '_id', isManySameKey = false}: {docs: Type[], keys: readonly ID[], propertyKey?: string, isManySameKey?: boolean}) => {
    const docsMap: Record<string, Type | Array<Type> | undefined> = {};

    docs.forEach(doc => {
        const currentKey = String(doc[propertyKey]);

        if(isManySameKey) {
            if(!docsMap[currentKey]) {
                docsMap[currentKey] = [];
            }

            (docsMap[currentKey] as Array<Type>).push(doc);
        } else {
            (docsMap[currentKey] as Type) = doc;
        }
    });

    return keys.map((key) => docsMap[String(key)]);
};

export interface NestDataLoaderFactoryOptions<ID, Type> {
    propertyKey?: string;
    isManySameKey?: boolean;
    query: (ids: readonly ID[]) => Promise<Type[]>;
    typeName?: string;
    dataloaderConfig?: DataLoader.Options<ID, Type[]>;
}

export abstract class NestDataLoaderFactory<ID, Type> {
    protected abstract getOptions: (context: GraphQLRequestContext) => NestDataLoaderFactoryOptions<ID, Type>;

    public generateDataLoader(context: GraphQLRequestContext) {
        const options = this.getOptions(context);
        
        return new DataLoader<ID, Type | Type[]>(async (keys) => {
            return ensureOrder({
                docs: await options.query(keys),
                keys,
                propertyKey: options.propertyKey,
                isManySameKey: options.isManySameKey,
            });
        }, {
            ...options.dataloaderConfig,
        });
    }
}