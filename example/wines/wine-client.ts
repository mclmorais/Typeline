import { z } from 'zod/v4'

const WineSchema = z.object({
    winery: z.string(),
    wine: z.string(),
    rating: z.object({
        average: z.string(),
        reviews: z.string(),
    }),
    location: z.string(),
    image: z.string(),
    id: z.number(),
})

export type Wine = z.infer<typeof WineSchema>

const WineListSchema = z.array(WineSchema)

export class WineClient {
    constructor(private baseUrl: string) { }

    async fetchReds(): Promise<Wine[]> {
        const response = await fetch(`${this.baseUrl}/wines/reds`)
        const data = await response.json()
        return WineListSchema.parse(data)
    }
}
