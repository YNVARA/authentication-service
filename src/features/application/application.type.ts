export type ApplicationFormRequest = {
    id?: string;
    name: string;
    description: string;
    allowed_origins?: string[];
}