import { ReturnTypeFunc, Mutation as GraphQLMutation, MutationOptions } from '@nestjs/graphql';
import { ErrorDocumentationOptions, ResolverDocumentationOptions } from '../interfaces';
import { stringifyResolverDocumentationOption } from '../utils';

type OmittedMutationOptions = Omit<MutationOptions, 'description'>;

export function Mutation(typeFunc: ReturnTypeFunc, documentationOptions: ResolverDocumentationOptions, options?: OmittedMutationOptions): MethodDecorator;
export function Mutation(typeFunc: ReturnTypeFunc, documentationOptions: ResolverDocumentationOptions, errorDocumentationOptionsArray: ErrorDocumentationOptions[], options?: OmittedMutationOptions): MethodDecorator;
export function Mutation(
    typeFunc: ReturnTypeFunc,
    documentationOptions: ResolverDocumentationOptions,
    errorDocumentationOptionsArrayOrOptions?: ErrorDocumentationOptions[] | OmittedMutationOptions,
    options?: OmittedMutationOptions
): MethodDecorator {
    if(errorDocumentationOptionsArrayOrOptions && Array.isArray(errorDocumentationOptionsArrayOrOptions)) {
        return GraphQLMutation(typeFunc, {
            ...options,
            description: stringifyResolverDocumentationOption(documentationOptions, errorDocumentationOptionsArrayOrOptions),
        });
    }
    
    return GraphQLMutation(typeFunc, {
        ...errorDocumentationOptionsArrayOrOptions,
        description: stringifyResolverDocumentationOption(documentationOptions),
    });
}