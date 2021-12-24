export interface WidgetConfig {
    cols: number,
    rows: number, 
    y: number,
    x: number, 
    config: WidgetItemConfig
}

export interface WidgetItemConfig {
    general: {
        type?: string,
        title?: string,
        readonly?: boolean
    },
    filter: {
        targetId?: string,
        additionalLogbooks?: string[],
        tags?: string[]
        ownerGroup?: string,
        accessGroups?: string[],
        snippetType?: string[]
    },
    view: {
        order?: string[],
        hideMetadata?: boolean,
        showSnippetHeader?: boolean
    }
}

// export interface UserConfig {
//     username: string,
//     userIcon: string | ArrayBuffer,
//     colorTheme?: string,
// }

export interface CollectionConfig {
    name: string;
    description?: string;
    thumbnail?: string;
    filter: any;
}

export interface UserPreferences {
    id?: string;
    userId?: string;
    collections?: CollectionConfig[];
    icon?: string;
}
