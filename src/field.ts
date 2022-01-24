import { Field as GraphQLField, ReturnTypeFunc } from "@nestjs/graphql";
import { serializeValidationOption } from "./serialize-validation-option";
import { OmittedFieldOptions, IValidationOptions } from "./types";

/**
 * 기존 graphql의 field 데코레이터에 유효성검사옵션을 추가하는 함수
 * @param returnTypeFunction graphql의 리턴타입
 * @param validateOptions 유효성 옵션
 * @param options 기존 필드 옵션
 * @returns 데코레이터
 * @author oz-k
 */
 export function Field(
    returnTypeFunction: ReturnTypeFunc, 
    defaultValidateOptions: IValidationOptions, 
    defaultOptions?: OmittedFieldOptions
) {
    return (
        validateOptions?: Partial<IValidationOptions>, 
        options?: Partial<OmittedFieldOptions>
    ) => GraphQLField(returnTypeFunction, {
        ...defaultOptions,
        ...options,
        description: serializeValidationOption({
            ...defaultValidateOptions,
            ...validateOptions
        })
    });
}