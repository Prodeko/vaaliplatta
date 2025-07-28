// app/page.tsx
import { db } from '@/lib/kysely'
import { ElectionSchema } from '@/lib/zod-validators'
import { Logo } from '@prodeko/visual-assets/react/logos'
import { Button } from '@/components/ui/button'

export const revalidate = 300

export default async function Page() {
    const latestElection = await db
        .selectFrom('election')
        .where('state', '=', 'open')
        .selectAll()
        .limit(1)
        .executeTakeFirst()

    const parsed = ElectionSchema.safeParse(latestElection)
    const election = parsed.success ? parsed.data : null

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-background text-foreground">
            <div className="max-w-xl w-full flex flex-col items-center gap-8">
                <div className="flex items-center gap-4">
                    <Logo className="h-24 w-auto text-prodeko" />
                    <h1 className="text-4xl font-heading tracking-widest text-center">Vaaliplatta</h1>
                </div>

                <p className="text-lg font-normal text-center">
                    Tervetuloa Prodekon vaalialustalle. Täällä voit tutustua avoimiin virkoihin ja ehdokkaisiin. Voit myös hakea itse toimarivirkaan!
                </p>

                {election &&
                    <div className="text-foreground text-center w-full font-semibold text-xl">
                        {election?.name} -vaalit ovat nyt auki!
                    </div>
                }

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    {election &&
                        <Button asChild className="w-full sm:w-auto">
                            <a href={"/" + election?.id}>Vaaleihin</a>
                        </Button>
                    }
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                        <a href="/">In english</a>
                    </Button>
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                        <a href="/admin">Hallintapaneeli</a>
                    </Button>
                </div>
            </div>
        </main>
    )
}
