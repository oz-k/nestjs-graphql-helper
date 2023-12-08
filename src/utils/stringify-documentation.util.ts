import { isString } from 'class-validator';
import { ErrorDocumentationOptions, FieldDocumentationOptions, ResolverDocumentationOptions } from '../interfaces';
import { MarkDown } from './markdown.util';

/**
 * object를 키의 우선순위대로 정렬해 반환하는 함수
 * @param object object
 * @param keyOrder object 키의 우선순위가 정의된 배열
 * @returns 정렬된 배열
 */
function sortObject<T extends Record<string, any>>(object: T, keyOrder: Array<keyof T>) {
    const sortedObjectArray = new Array<{key: keyof T, value: T[keyof T]}>(keyOrder.length).fill(undefined);

    (Object.keys(object) as Array<keyof T>).forEach(objectKey => {
        const order = keyOrder.findIndex(key => objectKey === key);

        if(order === -1) throw new Error('정의되지않은 키');
        
        sortedObjectArray[order] = {key: objectKey, value: object[objectKey]};
    });

    return sortedObjectArray.filter(item => item !== undefined);
}

/**
 * 문서옵션을 마크다운화 시키는 함수
 * @param documentationOptions 문서옵션
 * @param keyOrder 문서옵션의 키의 우선순위가 정의된 배열
 * @param toggleOptions 마크다운 토글 옵션
 * @returns 마크다운화된 문서옵션 문자열
 */
function generateDocumentationOptionsMarkDown<T extends Record<string, any>>(
    documentationOptions: T,
    keyOrder: {key: keyof T, kor: string}[],
    toggleOptions: {title: string, open?: boolean},
) {
    type TableHeaderKey = 'key' | 'value';
    const sortedDocumentationOptions = sortObject(documentationOptions, keyOrder.map(({key}) => key));
    const addedMarkDownDocumentationOptionsArray = sortedDocumentationOptions.map<Record<TableHeaderKey, string>>(({key, value}) => {
        const koreanKey = keyOrder.find(keyKoreanMap => keyKoreanMap.key === key).kor;

        return {
            key: MarkDown.bold(MarkDown.italic(koreanKey)),
            value: !isString(value) ? JSON.stringify(value) : value,
        };
    });
    const documentationOptionsTable = MarkDown.table<TableHeaderKey>(
        [
            {name: 'key', visible: false},
            {name: 'value', visible: false},
        ],
        addedMarkDownDocumentationOptionsArray
    );

    return MarkDown.toggle(toggleOptions.title, documentationOptionsTable, toggleOptions.open);
}

/**
 * 에러옵션을 마크다운화 시키는 함수
 * @param options 에러옵션
 * @returns 마크다운화된 에러옵션 문자열
 */
function generateErrorOptionsMarkDown(options: ErrorDocumentationOptions[]) {
    type TableHeaderKey = '에러코드' | '에러메세지' | '에러설명';

    // 중복된 에러 제거
    const duplicateRemovedOptions = options.reverse().filter((option, index, self) => {
        const currError = new option.error();
        const currCode = currError.extensions.code;
        const currMessage = currError.message;

        return index === self.findIndex(option => {
            const error = new option.error();
            const code = error.extensions.code;
            const message = error.message;

            return currCode === code && currMessage === message;
        });
    });
    // 에러코드 오름차순, 에러메세지 오름차순으로 정렬
    const sortedOptions = duplicateRemovedOptions.sort((curr, next) => {
        const currError = new curr.error();
        const nextError = new next.error();
    
        const currCode = currError.extensions.code;
        const nextCode = nextError.extensions.code;
    
        if(!currCode) throw new Error('에러코드가 존재해야함');
    
        if(currCode < nextCode) return -1;
        if(currCode > nextCode) return 1;
    
        const currMessage = currError.message;
        const nextMessage = nextError.message;
    
        if(currMessage < nextMessage) return -1;
        if(currMessage > nextMessage) return 1;
        
        return 0;
    });
    const addedMarkDownOptionsArray = sortedOptions.map<Record<TableHeaderKey, string>>(({error, description}) => {
        const { extensions, message } = new error();
        
        return {
            '에러코드': MarkDown.italic(extensions.code),
            '에러메세지': MarkDown.bold(message),
            '에러설명': description,
        };
    });
    const optionsTable = MarkDown.table<TableHeaderKey>(
        [
            {name: '에러코드'},
            {name: '에러메세지',},
            {name: '에러설명'},
        ],
        addedMarkDownOptionsArray,
    );

    return MarkDown.toggle('❗ 에러 명세', optionsTable);
}

/**
 * 필드 명세를 graphql의 description으로 사용가능하게 문자열화하는 함수
 * @param fieldDocumentationOptions 스웨거를 기반으로 둔 명세 옵션
 * @returns 문자열화된 description
 * @author oz-k
*/
export const stringifyFieldDocumentationOptions = (fieldDocumentationOptions: FieldDocumentationOptions) => {
    return generateDocumentationOptionsMarkDown(
        fieldDocumentationOptions,
        [
            {key: 'name', kor: '필드명'},
            {key: 'description', kor: '필드설명'},
            {key: 'required', kor: '필수여부'},
            {key: 'example', kor: '값 예시'},
            {key: 'default', kor: '기본값'},
            {key: 'enum', kor: '열거형'},
            {key: 'regex', kor: '정규식'},
            {key: 'minimum', kor: '숫자최솟값'},
            {key: 'maximum', kor: '숫자최댓값'},
            {key: 'minLength', kor: '문자열최소길이'},
            {key: 'maxLength', kor: '문자열최대길이'},
            {key: 'isArray', kor: '배열여부'},
            {key: 'uniqueItems', kor: '배열고유여부'},
            {key: 'minItems', kor: '배열최소길이'},
            {key: 'maxItems', kor: '배열최대길이'},
        ],
        {title: '🏷 필드 명세'},
    );
}

/**
 * Resolver 명세를 graphql의 description으로 사용가능하게 문자열화하는 함수
 * @param options 스웨거를 기반으로 둔 유효성검사 명세 옵션
 * @returns 문자열화된 description
 * @author oz-k
*/
export function stringifyResolverDocumentationOption(
    options: ResolverDocumentationOptions,
    errorOptionsArray?: ErrorDocumentationOptions[],
) {
    const { ...resolverDocumentationOptions } = options;
    const resolverDocumentationOptionsMarkDown = generateDocumentationOptionsMarkDown(
        resolverDocumentationOptions,
        [
            {key: 'name', kor: '기능'},
            {key: 'description', kor: '추가 설명'},
        ],
        {title: '📗 리졸버 명세', open: true},
    );

    if(!errorOptionsArray || !errorOptionsArray.length) {
        return resolverDocumentationOptionsMarkDown;
    }

    const errorOptionsMarkDown = generateErrorOptionsMarkDown(errorOptionsArray);

    return resolverDocumentationOptionsMarkDown+'\n\n\n\n'+errorOptionsMarkDown;
}