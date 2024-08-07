
export interface Filecontainer {
    style?: {
        width: string,
        height: string,
        ratio?: string,
    },
    file?: File,
    fileId?: string;
    fileExtension?: string;
    fileHash?: string;
    accessHash?: string;
}

export interface Basesnippets {
    id?: string;
    ownerGroup?: string;
    accessGroups?: string[];
    snippetType?: string;
    isPrivate?: boolean;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    subsnippets?: Basesnippets[];
    parentId?: string;
    tags?: string[];
    dashboardName?: string;
    files?: Filecontainer[],
    location?: string,
    defaultOrder?: number,
    linkType?: string,
    versionable?: boolean,
    deleted?: boolean
}
