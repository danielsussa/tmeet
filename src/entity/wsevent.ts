export interface WsEvent {
    kind:     string
    document: string
    date:     number
    old:      string
    new:      string
    name:     string
}