import { ResolveField as GraphQLResolveField, ReturnTypeFunc } from "@nestjs/graphql";
import { FieldDocumentationOptions, OmittedFieldOptions } from '../interfaces';
import { stringifyFieldDocumentationOptions } from '../utils';

// TODO: Query랑 Mutation 명세옵션 추가한 데코레이터 만들어야함

/**
 * 기존 graphql의 ResolveField 데코레이터에 명세옵션을 추가한 데코레이터
 * @param propertyName resolve될 프로퍼티명
 * @param returnTypeFunc graphql의 리턴타입
 * @param documentationOptions 명세 옵션
 * @param options 필드 옵션
 * @author oz-k
 */
export function ResolveField(
    propertyName: string,
    returnTypeFunc: ReturnTypeFunc,
    documentationOptions: FieldDocumentationOptions,
    options?: OmittedFieldOptions,
) {
    return GraphQLResolveField(propertyName, returnTypeFunc, {
        ...options,
        nullable: !documentationOptions.required,
        description: stringifyFieldDocumentationOptions(documentationOptions),
    });
}