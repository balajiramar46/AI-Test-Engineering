export interface DiscoveredElement {
    tag: string;
    type: string | null;
    category: string;

    id: string | null;
    name: string | null;

    text: string | undefined;
    value: string | null;

    placeholder: string | null;
    ariaLabel: string | null;
    title: string | null;

    visible: boolean;
}