import { Args, ArgsOptions } from "@nestjs/graphql";
import { ParseObjectIdPipe } from "../pipes";
import { GraphQLObjectID } from 'graphql-scalars';

export function ObjectIdArgs(property: string, options?: Omit<ArgsOptions, 'type'>) {
    return Args(
        property, 
        {
            ...options, 
            type: () => GraphQLObjectID
        },
        ParseObjectIdPipe
    );
}