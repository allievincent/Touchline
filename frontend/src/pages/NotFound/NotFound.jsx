import Button from '../../components/Button.jsx'

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-[10rem] font-extrabold leading-none text-gray-200 dark:text-white/10">404</p>
      <h1 className="-mt-6 text-4xl font-bold">Wide of the post</h1>
      <p className="mt-2 text-gray-500">That page doesn't exist.</p>
      <Button to="/" className="mt-6">Back home</Button>
    </div>
  )
}
