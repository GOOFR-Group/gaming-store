import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { ShoppingCart, Star } from 'lucide-react'

import { Carousel } from '@/components/carousel'
import { Game } from '@/components/game'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  addGameToCart,
  getPublisherGame,
  getUser,
  getUserCart,
} from '@/lib/api'
import { decodeTokenPayload, getToken } from '@/lib/auth'
import { TokenMissing } from '@/lib/errors'
import { gameQueryKey, userQueryKey } from '@/lib/query-keys'

export const Route = createFileRoute(
  '/_layout/publishers/$publisherId/games/$gameId',
)({
  component: Component,
})

/**
 * Query options for retrieving the signed in user.
 * @returns Query options.
 */
function userQueryOptions() {
  return queryOptions({
    queryKey: userQueryKey,
    async queryFn() {
      try {
        const token = getToken()
        const payload = decodeTokenPayload(token)

        const userId = payload.sub
        const user = await getUser(userId)

        return user
      } catch {
        return null
      }
    },
  })
}

function gameQueryOptions(gameId: string, publisherId: string) {
  return queryOptions({
    queryKey: gameQueryKey(gameId,publisherId),
    async queryFn() {
      const token = getToken()
      const payload = decodeTokenPayload(token)

      const userId = payload.sub
      const cartGames = await getUserCart(userId)
      const gameData = await getPublisherGame(publisherId, gameId)

      return {cartGames,gameData}
    },
  })
}

function AddToCart({ gameId, userId }: { gameId: string; userId?: string }) {
  /**
   * Adds a game to the cart.
   */

  const { toast } = useToast()

  const mutation = useMutation({
    async mutationFn() {
      await addGameToCart(userId!, gameId)
    },
    onSuccess() {
      toast({
        variant: 'success',
        title: 'Game Added!',
        description: 'The game was successfully added to your cart.',
      })
    },
    onError(error) {
      if (error instanceof TokenMissing) {
        toast({
          variant: 'destructive',
          title: 'Log in to perform this action',
        })
        return
      }

      toast({
        variant: 'destructive',
        title: 'Oops! An unexpected error occurred',
        description: 'Please try again later or contact the support team.',
      })
    },
  })

  function handleClick() {
    mutation.mutate()
  }

  return (
    <Button className="w-full text-lg py-6" onClick={handleClick}>
      <ShoppingCart className="mr-2" />
      Add to Cart
    </Button>
  )
}

function Component() {
  const params = useParams({
    from: '/_layout/publishers/$publisherId/games/$gameId',
  })

  const { data: {cartGames,gameData} } = useSuspenseQuery(gameQueryOptions(params.gameId,params.publisherId))

  const query = useSuspenseQuery(userQueryOptions())
  const userData = query.data

  const getLanguage = (code: string) => {
    const lang = new Intl.DisplayNames(['en'], { type: 'language' })
    return lang.of(code)
  }

  const country = gameData.languages.map((language) => getLanguage(language))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{gameData.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="aspect-video w-full max-h-[512px]">
              <Carousel />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">About the Game</h2>
              <p className="text-muted-foreground">{gameData.description}</p>

              <div className="flex flex-wrap items-start justify-between mt-4">
                <div className="flex gap-2 flex-wrap">
                  {gameData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag.name.toUpperCase()}
                    </Badge>
                  ))}
                </div>

                <img
                  alt="Age rating"
                  className="h-12"
                  src={`/images/pegi/${gameData.ageRating}.png`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">
                System Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Minimum:</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {gameData.requirements.minimum
                      .split('\n')
                      .map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Recommended:</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {gameData.requirements.recommended
                      .split('\n')
                      .map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-3xl font-bold">€{gameData.price}</span>
                <div className="flex items-center p-2 relative bg-gray-500">
                  <span className="w-full -rotate-12 h-1 z-10 absolute top-5 right-0 bg-white"></span>
                  <span className="w-full rotate-12 h-1 z-10  absolute top-5 right-0 bg-white"></span>
                  <Star className="text-yellow-400 fill-yellow-400 mr-1 opacity-65" />
                  <span className="font-semibold opacity-65">4.8</span>
                  <span className="text-muted-foreground ml-1">(2,945)</span>
                </div>
              </div>
              <AddToCart gameId={gameData.id} userId={userData?.id} />
              <Button className="w-full text-lg py-6 mt-2" variant="secondary">
                Add to Wishlist
              </Button>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Release Date:{' '}//
                {new Date(gameData BOAS PESSOAL, TODO: sem data neste objeto).toLocaleDateString('en-UK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Developed by</h3>
              <p className="text-muted-foreground">{gameData.publisher.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Game Features</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {gameData.features.split('\n').map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">
                Languages Supported
              </h3>
              <p className="text-sm text-muted-foreground">
                {country.join(', ')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="py-12 md:py-24 lg:py-32 px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter mb-8">
          More Like This
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {{gameData.map((data, index) => {
            return (
              <Game
                key={index} outro TODO aqui haha balls
                image={data.url}
                price={59.99}
                publisher={gameData.publisher}
                title={`Game ${index}`}
              />
            )
          })} }
        </div>
      </section>
    </div>
  )
}
