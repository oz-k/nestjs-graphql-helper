import { Type } from '@nestjs/common';
import { ApolloError } from 'apollo-server-core';

export interface FieldDocumentationOptions {
    name: string; //필드명
    example?: any; //데이터 예시
    required: boolean; //필수여부
    description?: string; //추가 설명
    default?: any; //기본값
    enum?: any[]; //열거형 제약조건
    regex?: string; //정규식 제약조건
    minimum?: number; //데이터 최소값
    maximum?: number; //데이터 최대값
    minLength?: number; //데이터 최소길이
    maxLength?: number; //데이터 최대길이
    isArray?: boolean; //배열여부
    minItems?: number; //배열의 최소길이
    maxItems?: number; //배열의 최대길이
    uniqueItems?: boolean; //배열 고유여부
}

export interface ErrorDocumentationOptions {
    error: Type<ApolloError>;
    description: string;
};

export interface ResolverDocumentationOptions {
    name: string; // 리졸버 기능
    description?: string; // 추가 설명
}