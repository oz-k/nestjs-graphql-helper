import { Query as GraphQLQuery, QueryOptions, ReturnTypeFunc } from '@nestjs/graphql';
import { ErrorDocumentationOptions, ResolverDocumentationOptions } from '../interfaces';
import { stringifyResolverDocumentationOption } from '../utils';

type OmittedQueryOptions = Omit<QueryOptions, 'description'>;

export function Query(typeFunc: ReturnTypeFunc, documentationOptions: ResolverDocumentationOptions, options?: OmittedQueryOptions): MethodDecorator;
export function Query(typeFunc: ReturnTypeFunc, documentationOptions: ResolverDocumentationOptions, errorDocumentationOptionsArray: ErrorDocumentationOptions[], options?: OmittedQueryOptions): MethodDecorator;
export function Query(
    typeFunc: ReturnTypeFunc,
    documentationOptions: ResolverDocumentationOptions,
    errorDocumentationOptionsArrayOrOptions?: ErrorDocumentationOptions[] | OmittedQueryOptions,
    options?: OmittedQueryOptions
): MethodDecorator {
    if(errorDocumentationOptionsArrayOrOptions && Array.isArray(errorDocumentationOptionsArrayOrOptions)) {
        return GraphQLQuery(typeFunc, {
            ...options,
            description: stringifyResolverDocumentationOption(documentationOptions, errorDocumentationOptionsArrayOrOptions),
        });
    }

    return GraphQLQuery(typeFunc, {
        ...errorDocumentationOptionsArrayOrOptions,
        description: stringifyResolverDocumentationOption(documentationOptions),
    });
}