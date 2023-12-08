import { FieldOptions } from "@nestjs/graphql";

export type OmittedFieldOptions = Omit<FieldOptions, 'description' | 'nullable'>;