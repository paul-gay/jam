import { createClient } from 'contentful'
import RecipeCard from '../components/RecipeCard'

/**
 * getStaticProps is function used to get data 
 * and then use that data to inject props into components to be rendered in browser
 */
export async function getStaticProps() {
  // connect to contentful
  const client = createClient({
    // tell which space to connect to
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY,
  })

  // get recipes from contentful space
  // they will be stored on an 'items' propery in response object
  const res = await client.getEntries({ content_type: 'recipe' })

  // return property has a 'props' object -- 
  // any item passed into props object is passed to 'recipes' component as a prop
  return {
    props: {
      recipes: res.items,
    }
  }
}


export default function Recipes({ recipes }) {
  console.log(recipes)

  return (
    <div className="recipe-list">
      {recipes.map(recipe => (
        <RecipeCard key={recipe.sys.id} recipe={recipe} />
      ))}
      <style jsx>{`
        .recipe-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 20px 60px;
        }
      `}</style>
    </div>
  )
}