import { useState, useEffect } from 'react';

export function useMovies(query) {
	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(
		function () {
			// handleCloseMovie();
			const controller = new AbortController();

			async function fetchMovies() {
				try {
					setIsLoading(true);
					setError('');

					const res = await fetch(
						`http://www.omdbapi.com/?apikey=33febabc&s=${query}`,
						{ signal: controller.signal }
					);

					if (!res.ok)
						throw new Error(
							'Something went wrong with fetching movies'
						);

					const data = await res.json();
					// console. (data);

					if (data.Response === 'False')
						throw new Error('Movie not found');

					setMovies(data.Search);
				} catch (error) {
					if (error.name !== 'AbortError')
						setError(() => error.message);
				} finally {
					setIsLoading(false);
				}
			}

			if (query.length < 3) {
				setMovies([]);
				setError('');
				return;
			}

			fetchMovies();

			return function () {
				controller.abort();
			};
		},
		[query]
	);

	return { movies, isLoading, error };
}
