type Content<T extends string> = {[key in T]?: string}
type Alignment = 'left' | 'right' | 'center';

export class MarkDown {
    static bold(value: string) {
        return value ? `**${value}**` : '';
    }

    static italic(value: string) {
        return value ? `_${value}_` : '';
    }

    static toggle(summary: string, content: string, open: boolean = false) {
        return `<details${open ? ' open' : ''}>`+
            `<summary><b>${summary}</b></summary>\n\n`+
            `${content}\n\n`+
            '---\n\n'+ // 토글의 마지막을 나타내기위한 헤어라인
            '</details>';
    }
    
    static table<T extends string>(
        headerOptions: {name: T, alignment?: Alignment, visible?: boolean}[],
        contents: Content<T>[],
    ) {
        if(!headerOptions.length) throw new Error('헤더가 존재해야함');

        const tableHeaderIndexMap = new Map<T, number>();
        let tableHeaderName = '|';
        let tableHeader = '|';
        let tableContent = '';

        headerOptions.forEach((headerOption, index) => {
            const { name, alignment = 'left', visible } = headerOption;

            if(tableHeaderIndexMap.get(name)) throw new Error('이미 해당 이름의 헤더가 존재함');

            if(!(visible ?? true)) tableHeaderName += '|';
            // NOTE: 테이블 간격 띄우려고 끝에 공백2개를 추가하는데 우측정렬일때 헤더가 밀려서 추가로 공백줌
            else tableHeaderName += `${name}${alignment === 'right' ? '&nbsp;&nbsp;': ''}|`;

            let baseHeader = '---';
            if(alignment === 'left' || alignment === 'center') baseHeader = `:${baseHeader}`;
            if(alignment === 'right' || alignment === 'center') baseHeader = `${baseHeader}:`;

            tableHeader += `${baseHeader}|`;
            tableHeaderIndexMap.set(name, index);
        });

        contents.forEach(content => {
            const headerNames = Object.keys(content) as T[];
            const tempContentArr: string[] = new Array(headerOptions.length).fill(undefined);

            headerNames.forEach((headerName) => {
                tempContentArr[tableHeaderIndexMap.get(headerName)] = content[headerName];
            });

            tableContent += `|${tempContentArr.join('&nbsp;&nbsp;|')}|\n`;
        });

        return `${tableHeaderName}\n${tableHeader}\n${tableContent}`;
    }
}