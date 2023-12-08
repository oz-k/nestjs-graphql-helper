import { OffsetPaginatedInfo, OffsetPaginatedResult } from '@a-part/mongoose-pagination-plugin';
import { Type } from "@nestjs/common";
import { ObjectType } from "@nestjs/graphql";
import { GraphQLInt } from "graphql";
import { Field } from '../decorators';

@ObjectType()
class OffsetPaginatedInfoDto implements OffsetPaginatedInfo {
    @Field(() => GraphQLInt, {
        name: '총 아이템 개수',
        required: true
    })
    totalCount: number;
}

/**
 * offset기반 pagination result dto를 만드는 함수
 * @param classRef 페이징된 item의 타입
 * @returns dto
 * @author oz-k
 */
export function OffsetPaginatedDto<T>(classRef: Type<T>): Type<OffsetPaginatedResult<T>> {
    @ObjectType()
    class OffsetPaginatedDto implements OffsetPaginatedResult<T> {
        @Field(() => OffsetPaginatedInfoDto, {
            name: '페이징정보',
            required: true
        })
        offsetPaginatedInfo: OffsetPaginatedInfoDto;
        
        @Field(() => [classRef], {
            name: '아이템들',
            required: true
        })
        items: T[];
    }

    return OffsetPaginatedDto;
}