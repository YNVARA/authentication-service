export type ApplicationDeveloperFormRequest = {
    id?: string;
    name: string;
    description: string;
    allowed_origins?: string[];
    active?: boolean;
}