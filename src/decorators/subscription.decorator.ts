import { ReturnTypeFunc, Subscription as GraphQLSubscription, SubscriptionOptions } from '@nestjs/graphql';
import { ErrorDocumentationOptions, ResolverDocumentationOptions } from '../interfaces';
import { stringifyResolverDocumentationOption } from '../utils';

type OmittedSubscriptionOptions = Omit<SubscriptionOptions, 'description'>;

export function Subscription(typeFunc: ReturnTypeFunc, documentationOptions: ResolverDocumentationOptions, options?: SubscriptionOptions): MethodDecorator;
export function Subscription(typeFunc: ReturnTypeFunc, documentationOptions: ResolverDocumentationOptions, errorDocumentationOptionsArray: ErrorDocumentationOptions[], options?: OmittedSubscriptionOptions): MethodDecorator;
export function Subscription(
    typeFunc: ReturnTypeFunc,
    documentationOptions: ResolverDocumentationOptions,
    errorDocumentationOptionsArrayOrOptions?: ErrorDocumentationOptions[] | OmittedSubscriptionOptions,
    options?: OmittedSubscriptionOptions,
): MethodDecorator {
    if(errorDocumentationOptionsArrayOrOptions && Array.isArray(errorDocumentationOptionsArrayOrOptions)) {
        return GraphQLSubscription(typeFunc, {
            ...options,
            description: stringifyResolverDocumentationOption(documentationOptions, errorDocumentationOptionsArrayOrOptions),
        });
    }
    
    return GraphQLSubscription(typeFunc, {
        ...errorDocumentationOptionsArrayOrOptions as OmittedSubscriptionOptions,
        description: stringifyResolverDocumentationOption(documentationOptions),
    });
}