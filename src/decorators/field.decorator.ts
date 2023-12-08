import { Field as GraphQLField, FieldOptions, ReturnTypeFunc } from "@nestjs/graphql";
import { stringifyFieldDocumentationOptions } from "../utils";
import { FieldDocumentationOptions, OmittedFieldOptions } from "../interfaces";

export function Field(documentationOptions: FieldDocumentationOptions, options?: OmittedFieldOptions): PropertyDecorator;
export function Field(returnTypeFunc: ReturnTypeFunc, documentationOptions: FieldDocumentationOptions, options?: OmittedFieldOptions): PropertyDecorator;
export function Field(
    returnTypeFuncOrDocumentationOptions: ReturnTypeFunc | FieldDocumentationOptions,
    documentationOptionsOrOptions: FieldDocumentationOptions | OmittedFieldOptions,
    options?: OmittedFieldOptions,
) {
    const isExistReturnTypeFunc = typeof returnTypeFuncOrDocumentationOptions === 'function';
    const returnTypeFunc = isExistReturnTypeFunc && returnTypeFuncOrDocumentationOptions;
    const documentationOptions = isExistReturnTypeFunc && documentationOptionsOrOptions as FieldDocumentationOptions;

    const fieldOptions: FieldOptions = {
        ...options,
        nullable: !documentationOptions.required,
        description: stringifyFieldDocumentationOptions(documentationOptions),
    };
    
    return isExistReturnTypeFunc
        ? GraphQLField(returnTypeFunc, fieldOptions)
        : GraphQLField(fieldOptions);
}

/**
 * 명세옵션이 추가된 Field 데코레이터에 기본값을 먹이는 함수
 * @param defaultReturnTypeFunction graphql의 리턴타입
 * @param defaultDocumentationOptions 명세 옵션
 * @param defaultOptions 필드 옵션
 * @returns Field 데코레이터
 * @author oz-k
 */
export function FieldDefault(
    defaultReturnTypeFunction: ReturnTypeFunc | null, 
    defaultDocumentationOptions: FieldDocumentationOptions, 
    defaultOptions?: OmittedFieldOptions
) {
    /** 기존 graphql의 Field 데코레이터에 명세옵션을 추가한 데코레이터 */
    function Field(documentationOptions?: Partial<FieldDocumentationOptions>, options?: Partial<OmittedFieldOptions>): ReturnType<typeof GraphQLField>;
    function Field(returnTypeFunction?: ReturnTypeFunc, documentationOptions?: Partial<FieldDocumentationOptions>, options?: Partial<OmittedFieldOptions>): ReturnType<typeof GraphQLField>;
    function Field(
        returnTypeFunctionOrDocumentationOptions?: ReturnTypeFunc | Partial<FieldDocumentationOptions>,
        documentationOptionsOrOptions?: Partial<FieldDocumentationOptions> | Partial<OmittedFieldOptions>, 
        options?: Partial<OmittedFieldOptions>,
    ) {
        const isExistReturnTypeFunc = returnTypeFunctionOrDocumentationOptions && typeof returnTypeFunctionOrDocumentationOptions === 'function';

        const documentationOptions: FieldDocumentationOptions = {
            ...defaultDocumentationOptions,
            ...(isExistReturnTypeFunc
                ? documentationOptionsOrOptions
                : returnTypeFunctionOrDocumentationOptions
            ) as FieldDocumentationOptions
        }
        
        const returnTypeFunction: ReturnTypeFunc | null = isExistReturnTypeFunc
            ? returnTypeFunctionOrDocumentationOptions
            : defaultReturnTypeFunction;

        const fieldOptions: FieldOptions = {
            ...defaultOptions,
            ...options,
            nullable: !documentationOptions.required,
            description: stringifyFieldDocumentationOptions(documentationOptions),
        };

        return returnTypeFunction
            ? GraphQLField(returnTypeFunction, fieldOptions)
            : GraphQLField(fieldOptions);
    }

    return Field;
}