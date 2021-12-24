import { Basesnippets } from './basesnippets';
import { WidgetConfig } from './config';

export interface viewConfig {
    widgetConfig: WidgetConfig[],
    isTemplate: boolean
}

export interface Views extends Basesnippets {
    name: string;
    description?: string;
    location?: string;
    configuration: viewConfig;
}
