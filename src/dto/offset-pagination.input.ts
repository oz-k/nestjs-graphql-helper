import { IOffsetPaginationOption } from "@a-part/mongoose-pagination-plugin";
import { FieldDefault } from "../decorators";
import { Type } from "@nestjs/common";
import { InputType } from "@nestjs/graphql";
import { Type as TransformType } from 'class-transformer';
import { Max, Min, ValidateNested } from "class-validator";
import { GraphQLInt } from "graphql";

const PAGE_SIZE = {
    MIN: 1
}
const LIMIT_SIZE = {
    MIN: 1,
    MAX: 20
}

//페이징 요청 인터페이스
export interface IOffsetPagination<T> {
    offsetPaginationOption: IOffsetPaginationOption;
    filter?: T;
}

//페이징옵션 클래스
@InputType()
class OffsetPaginationOptionInput implements IOffsetPaginationOption {
    @FieldDefault(() => GraphQLInt, {
        name: '현재 페이지',
        example: 1,
        required: true,
        minimum: PAGE_SIZE.MIN
    })()
    @Min(PAGE_SIZE.MIN)
    page: number;

    @FieldDefault(() => GraphQLInt, {
        name: '가져올 아이템 개수',
        example: 10,
        required: true,
        minimum: LIMIT_SIZE.MIN,
        maximum: LIMIT_SIZE.MAX    
    })()
    @Min(LIMIT_SIZE.MIN)
    @Max(LIMIT_SIZE.MAX)
    limit: number;
}

/**
 * 페이징 request를 제네릭으로 만드는 함수
 * @param classRef 페이징 filter 타입
 * @returns 페이징 request
 * @author oz-k
 */
 export function OffsetPagination<T>(classRef?: Type<T>): Type<IOffsetPagination<T>> {
    //필터가 있는 페이징인풋
    @InputType()
    class OffsetPaginationFilterInput<T> implements IOffsetPagination<T> {
        @FieldDefault(() => OffsetPaginationOptionInput, {
            name: '페이징 옵션',
            required: true
        })()
        @TransformType(() => OffsetPaginationOptionInput)
        @ValidateNested()
        offsetPaginationOption: OffsetPaginationOptionInput;

        @FieldDefault(() => classRef, {
            name: '검색필터',
            required: true
        })()
        @TransformType(() => classRef)
        @ValidateNested()
        filter: T;
    }

    //필터가 없는 페이징인풋
    @InputType()
    class OffsetPaginationInput {
        @FieldDefault(() => OffsetPaginationOptionInput, {
            name: '페이징 옵션',
            required: true
        })()
        @TransformType(() => OffsetPaginationOptionInput)
        @ValidateNested()
        offsetPaginationOption: OffsetPaginationOptionInput;
    }

    //필터타입이 주어졌을경우 필터가 존재하는 인풋을 리턴, 아니면 필터가 없는 인풋을 리턴
    return classRef ? OffsetPaginationFilterInput : OffsetPaginationInput;
}