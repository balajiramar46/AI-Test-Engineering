export interface TestAction {

   action: 'click' | 'fill' | 'check' | 'uncheck' | 'select' | 'press' | 'pageObject';

    target: {
        category: string;
        text?: string;
        value?: string;
        id?: string;
        name?: string;
        placeholder?: string;
        ariaLabel?: string;
        title?: string;
        intent?: 'search';
        pageObject?: 'ProductSearchPage';
        method?: 'searchFor' | 'openProduct' | 'addToCart';
    };

    inputValue?: string;
}
