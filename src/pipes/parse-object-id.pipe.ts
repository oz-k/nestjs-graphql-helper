import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { ValidationError } from "apollo-server-core";
import { Types } from "mongoose";


export class ParseObjectIdPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if(!Types.ObjectId.isValid(value)) {
            throw new ValidationError(`${metadata.data} must be ObjectId format`);
        }
        
        return new Types.ObjectId(value);
    }
}