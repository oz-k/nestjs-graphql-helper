import { CursorPaginatedInfo, CursorPaginatedResult } from '@a-part/mongoose-pagination-plugin';
import { Type } from '@nestjs/common';
import { ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';
import { Field } from '../decorators';

@ObjectType()
class CursorPaginatedInfoDto implements CursorPaginatedInfo {
    @Field(() => GraphQLInt, {
        name: '총 아이템 개수',
        required: true,
    })
    totalCount: number;
}

/**
 * 커서기반 페이징의 result dto를 만드는 함수
 * @param classRef 페이징된 item의 타입
 * @returns dto
 * @author oz-k
 */
export function CursorPaginatedDto<T>(classRef: Type<T>): Type<CursorPaginatedResult<T>> {
    @ObjectType()
    class CursorPaginatedDto implements CursorPaginatedResult<T> {
        @Field(() => CursorPaginatedInfoDto, {
            name: '페이징정보',
            required: true,
        })
        cursorPaginatedInfo: CursorPaginatedInfoDto;

        @Field(() => [classRef], {
            name: '아이템들',
            required: true,
        })
        items: T[];
    }

    return CursorPaginatedDto;
}