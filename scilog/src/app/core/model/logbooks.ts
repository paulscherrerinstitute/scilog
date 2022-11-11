import { Basesnippets } from "./basesnippets";

export interface Logbooks extends Basesnippets {
    name?: string;
    description?: string;
    thumbnail?: string;
    location?: string;
    readACL?: string[];
}
