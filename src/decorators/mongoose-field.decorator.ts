import { GraphQLISODateTime } from "@nestjs/graphql";
import { GraphQLObjectID } from 'graphql-scalars';
import { FieldDefault } from "./field.decorator";

export const ObjectIdField = FieldDefault(() => GraphQLObjectID, {
    name: '고유 아이디',
    example: '61dd715ee05d21292eee0518',
    required: true
});

export const CreatedAtField = FieldDefault(() => GraphQLISODateTime, {
    name: '생성일',
    example: '2022-02-18T10:53:49.495Z',
    required: true
});

export const UpdatedAtField = FieldDefault(() => GraphQLISODateTime, {
    name: '최종 수정일',
    example: '2022-02-18T10:53:49.495Z',
    required: true
});