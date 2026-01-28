import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br ">

            <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-yellow-400">
                404
            </h1>

            <p className="mt-6 text-center text-xl md:text-2xl max-w-lg text-black-200">
                Oops! The page you are looking for does not exist.
            </p>

            <p className="mt-2 text-gray-500 text-center">
                You might have mistyped the URL or the page has been moved.
            </p>

            <Link
                to="/"
                className="mt-8 inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition transform hover:scale-105"
            >
                Go Back Home
            </Link>

            {/* Optional Illustration */}
            <div className="mt-12">
                <img
                    src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
                    alt="404 Illustration"
                    className="w-72 md:w-96"
                />
            </div>
        </div>
    );
}
