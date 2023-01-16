
export default function Button({ onClick, children, ...props }) {
  return (
    <button className="relative inline-flex items-center justify-center p-0.5 my-1 h-8 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient group-hover:bg-gradient-to-tl hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
      onClick={onClick}>
      <span className="relative px-2 py-1 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
        {children}
      </span>
    </button>
  )
}