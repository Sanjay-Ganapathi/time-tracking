

export interface Task {
    id: string;
    name: string;
    projectId: string;
}

export interface Project {
    id: string;
    name: string;
    tasks: Task[];
}

export interface Employee {
    id: string;
    email: string;
    name: string;
    apiKey: string;
    activated: boolean;
}