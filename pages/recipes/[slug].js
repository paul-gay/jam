import { createClient } from 'contentful'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import Image from 'next/image'
import Skeleton from '../../components/Skeleton'

// Communicate with Contentful
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
})

/**
 * Each path is determined by its [slug] component
 * need to generate a static page for EACH route -- so each route shows its own corresponding data
 * getStaticPaths() function will:
 * 1. find ALL paths that use a specified component [slug]/RecipeDeatils as its page
 * 2. nextjs will then generate statci pages for EACH path at build time
 */

/**
 * 1. need to find the slug for EVERY recipe inside contentful -- they will be the path for each page generated
 * 
 */
export const getStaticPaths = async () => {
  // get all entries
  const res = await client.getEntries({ 
    // this will store all the recipes inside the 'items' property on the response object
    content_type: "recipe" 
  })

  // format array of paths from return to extract the slug from object
  const paths = res.items.map(item => {
    return {
      params: { slug: item.fields.slug }
    }
  })

  // return object containing 'paths' propery
  return {
    // paths should be an array of path objects that nextjs uses to build static pages for each path
    paths,
    /** fallback: false will return 404 page
    * true will try to return a fallback version of the RecipeDetails component
    * it will basically try to return component to browser
    * once you have the data you pass it into the component
    * it does so by re-running getStaticProps from above
    * it takes the data from running getStaticProps and passes into the component (RecipeDetails)
    */
    fallback: true
  }
}

/**
 * use getStaticProps function to access the data for each individual page generated
 * getStaticProps will run on each static page from above
 * each time it runs -- it passed in CONTEXT object that has a PARAMS property
 * destructure params from context obj
 * this params contains the slug from the returned from 'paths' function above
 * this slug will limit our request to the single recipe rather than running it for all recipes
 */
export const getStaticProps = async ({ params }) => {
  /** 
  * get single item (recipe) you need based on path you are on
  * the single item will be passed into RecipeDetails component as a prop
  * destructure 'items' from response
  * const res = await client.getEntries
  */
  const { items } = await client.getEntries({
    content_type: 'recipe',
    'fields.slug': params.slug
  })

  /**
   * if data doesn't exist:
   * redirect user to homepage
   */
   if (!items.length) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  

  return {
    /**
     * must return props so they can be passed into the component
     * fields.slug: params.slug above will ALWAYS return an array -- so take the first item
     */
    props: { recipe: items[0] },
    // time in seconds that content will update & regenerate page
    // only updates when users visit page -- not constantly updating every second
    revalidate: 1
  }

}



export default function RecipeDetails({ recipe }) {
  // console.log(recipe)
  
  /**
   * if nothing is returned from getStaticProps
   * return a Skeleton component
   * Skeleton serves as a loading screen for when data is being loaded
   */
  if (!recipe) return <Skeleton />

  const { featuredImage, title, cookingTime, ingredients, method } = recipe.fields

  return (
    <div>

      <div className="banner">
        <Image 
          src={'https:' + featuredImage.fields.file.url}
          width={featuredImage.fields.file.details.image.width}
          height={featuredImage.fields.file.details.image.height}
        />
        <h2>{ title }</h2>
      </div>

      <div className="info">
        <p>Takes about { cookingTime } mins to cook.</p>
        <h3>Ingredients:</h3>

        {ingredients.map(ing => (
          <span key={ing}>{ ing }</span>
        ))}
      </div>

      <div className="method">
        <h3>Method:</h3>
        <div>{documentToReactComponents(method)}</div>
      </div>

      <style jsx>{`
        h2,h3 {
          text-transform: uppercase;
        }

        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0,0,0,0.1);
        }

        .info p {
          margin: 0;
        }

        .info span::after {
          content: ", ";
        }
        
        .info span:last-child::after {
          content: ".";
        }
      `}</style>

    </div>
  )
}