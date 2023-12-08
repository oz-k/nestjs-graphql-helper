import { CursorPaginationOptions } from '@a-part/mongoose-pagination-plugin';
import { Type } from '@nestjs/common';
import { InputType, IntersectionType, PartialType } from '@nestjs/graphql';
import { Type as TransformType } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, Max, Min, registerDecorator, ValidateNested, ValidationArguments, ValidationOptions } from 'class-validator';
import { GraphQLBoolean, GraphQLInt, GraphQLString } from 'graphql';
import { GraphQLObjectID } from 'graphql-scalars';
import { Types } from 'mongoose';
import { Field } from '../decorators';

function IsExistCursorByPaginationField(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            name: 'isExistCursorByPaginationField',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(paginationField: string, args: ValidationArguments) {
                    const cursor = (args.object as any)['cursor'];

                    if(!cursor) return true;
                    if(cursor[paginationField] !== null && cursor[paginationField] !== undefined) return true;
                    return false;
                },
                defaultMessage(args: ValidationArguments) {
                    return 'cursor.$value must exist';
                }
            }
        })
    }
}

const LIMIT_SIZE = {
    MIN: -20,
    MAX: 20,
}

type BaseCursorPaginationCursorInputType = {
    _id: Types.ObjectId;
}

@InputType()
class BaseCursorPaginationCursorInput implements BaseCursorPaginationCursorInputType {
    @IsNotEmpty()
    @Field(() => GraphQLObjectID, {
        name: '_id',
        required: true,
    })
    _id: Types.ObjectId;
}

function genCursorPaginationOptionInput<PF extends string>(cursorClassRef?: Type<{[key in PF]?: any}>): Type<CursorPaginationOptions<PF>> {
    let cursorKeys = ['_id'];
    let cursorClass: Type<any> = class extends BaseCursorPaginationCursorInput {};

    if(cursorClassRef) {
        cursorKeys = cursorKeys.concat(Object.keys(new cursorClassRef)).filter((value, idx, self) => self.indexOf(value) === idx);
        // @ts-ignore 동적 extends를 사용하기위해 ignore함
        cursorClass = class extends IntersectionType(PartialType(cursorClassRef), BaseCursorPaginationCursorInput) {}
    }

    InputType()(cursorClass)

    @InputType()
    class CursorPaginationOptionInput implements CursorPaginationOptions<any> {
        @IsNotEmpty()
        @Field(() => GraphQLBoolean, {
            name: '커서 스킵여부',
            required: true,
            description: '값이 true일 경우 결과에 커서를 포함하지 않음(ex: 전체값이 [1,2,3]일 때 limit이 2이고 cursor가 1이라면 [2,3]를 반환), false일 경우 결과에 커서를 포함함(ex: [1,2,3]일 때 limit이 2이고 cursor가 1이라면 [1,2]을 반환함)'
        })
        skipCursor: boolean;
        
        @IsNotEmpty()
        @Min(LIMIT_SIZE.MIN)
        @Max(LIMIT_SIZE.MAX)
        @Field(() => GraphQLInt, {
            name: '가져올 아이템 개수',
            required: true,
            description: '양수가 주어질경우 커서다음으로 limit개수만큼 가져오고 음수가 주어질경우 커서 이전으로 limit 절대값 개수만큼 가져옴(ex: 전체값이 [1,2,3]이고 limit이 -2일 때 커서가 3일경우 [1,2]를 반환)',
            minimum: LIMIT_SIZE.MIN,
            maximum: LIMIT_SIZE.MAX,
        })
        limit: number;
        
        @IsNotEmpty()
        @IsEnum(cursorKeys)
        @IsExistCursorByPaginationField()
        @Field(() => GraphQLString, {
            name: '페이징할 필드명',
            required: false,
            default: '_id',
            enum: cursorKeys,
        })
        paginationField: PF = '_id' as PF;

        @IsOptional()
        @TransformType(() => cursorClass)
        @ValidateNested()
        @Field(() => cursorClass, {
            name: '커서',
            required: false,
            description: '커서가 주어지지 않을 경우 처음값(limit이 양수일경우 작은순대로, 음수일경우 큰순대로)을 가져오며 skipCursor가 true여도 무시됨'
        })
        cursor?: {[key in PF]: any} & BaseCursorPaginationCursorInputType;
    }
    
    return CursorPaginationOptionInput;
}


// 커서기반 페이징 인풋의 최종 타입
export interface GetCursorPaginatedInput<PF extends string, F = any> {
    cursorPaginationOption: CursorPaginationOptions<PF>;
    filter?: F;
}

// 커서기반페이징인풋만드는 함수
export function GetCursorPaginatedInput<
    PF extends string = string,
    F = any
>(
    cursorClassRef?: Type<{[key in PF]?: any}>,
    filterClassRef?: Type<F>
): Type<GetCursorPaginatedInput<PF, F>> {
    @InputType()
    class CursorPaginationOptionInput extends genCursorPaginationOptionInput<PF>(cursorClassRef) {}

    @InputType()
    class CursorPaginationFilterInput implements GetCursorPaginatedInput<PF, F> {
        @TransformType(() => CursorPaginationOptionInput)
        @ValidateNested()
        @Field(() => CursorPaginationOptionInput, {
            name: '페이징옵션',
            required: true,
        })
        cursorPaginationOption: CursorPaginationOptionInput;
        
        @TransformType(() => filterClassRef)
        @ValidateNested()
        @Field(() => filterClassRef, {
            name: '검색필터',
            required: true
        })
        filter: F;
    }

    @InputType()
    class CursorPaginationInput implements GetCursorPaginatedInput<PF, F> {
        @TransformType(() => CursorPaginationOptionInput)
        @ValidateNested()
        @Field(() => CursorPaginationOptionInput, {
            name: '페이징옵션',
            required: true,
        })
        cursorPaginationOption: CursorPaginationOptionInput;
    }

    return filterClassRef ? CursorPaginationFilterInput : CursorPaginationInput;
}