export interface TestAction {

   action: 'click' | 'fill' | 'check' | 'uncheck' | 'select';

    target: {
        category: string;
        text?: string;
        value?: string;
        id?: string;
        name?: string;
    };

    inputValue?: string;
}