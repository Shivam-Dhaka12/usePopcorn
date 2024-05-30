import { func } from 'prop-types';
import { useEffect, useState } from 'react';
import Loader from './Components/Loader';
import StarRating from './Components/StarRating';

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Navbar({ children }) {
	return <nav className="nav-bar">{children}</nav>;
}

function Search({ query, setQuery }) {
	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
		/>
	);
}

function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

function NumResults({ movies }) {
	return (
		<p className="num-results">
			Found <strong>{movies ? movies.length : 0}</strong> results
		</p>
	);
}

function Main({ children }) {
	return <main className="main">{children}</main>;
}

function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="box">
			<button
				className="btn-toggle"
				onClick={() => setIsOpen((open) => !open)}
			>
				{isOpen ? '–' : '+'}
			</button>
			{isOpen && children}
		</div>
	);
}

function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie
					movie={movie}
					onSelectMovie={onSelectMovie}
					key={movie.imdbID}
				/>
			))}
		</ul>
	);
}

function Movie({ movie, onSelectMovie }) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}

function MovieDetails({
	selectedId,
	onCloseMovie,
	onAddWatchedMovie,
	watched,
}) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState('');

	const isWatched = watched
		.map((movie) => movie.imdbID)
		.includes(movie.imdbID);

	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	function handleAddWatched(params) {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(' ').at(0)),
			userRating,
		};

		onAddWatchedMovie(newWatchedMovie);
		onCloseMovie();
	}

	useEffect(
		function () {
			function callback(e) {
				if (e.code === 'Escape') {
					onCloseMovie();
					console.log('closing');
				}
			}
			document.addEventListener('keydown', callback);

			return function () {
				document.removeEventListener('keydown', callback);
			};
		},
		[onCloseMovie]
	);

	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie | ${title}`;

			return function () {
				document.title = 'usePopcorn';
			};
		},
		[title]
	);

	useEffect(
		function () {
			setIsLoading(true);
			async function getMovieDetails() {
				const res = await fetch(
					`http://www.omdbapi.com/?apikey=33febabc&i=${selectedId}`
				);

				const data = await res.json();
				setMovie(data);
				setIsLoading(false);
			}

			getMovieDetails();
		},
		[selectedId]
	);

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${movie} movie`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐</span>
								{imdbRating} IMDB rating
							</p>
						</div>
					</header>

					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating
										size={26}
										maxRating={10}
										onSetRating={setUserRating}
									/>

									{userRating > 0 && (
										<button
											className="btn-add"
											onClick={handleAddWatched}
										>
											+ Add to list
										</button>
									)}
								</>
							) : (
								<button className="btn-add">
									You rated this movie {watchedUserRating}{' '}
									<span>⭐</span>
								</button>
							)}
						</div>

						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	);
}

function WatchedSummary({ watched }) {
	const avgImdbRating = Math.round(
		average(watched.map((movie) => movie.imdbRating))
	);
	const avgUserRating = Math.round(
		average(watched.map((movie) => movie.userRating))
	);
	const avgRuntime = Math.round(
		average(watched.map((movie) => movie.runtime))
	);

	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime} min</span>
				</p>
			</div>
		</div>
	);
}

function WatchedMovieList({ watched, onDeleteWatched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie
					movie={movie}
					key={movie.imdbID}
					onDeleteWatched={onDeleteWatched}
				/>
			))}
		</ul>
	);
}

function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>

				<button
					className="btn-delete"
					onClick={() => onDeleteWatched(movie.imdbID)}
				>
					X
				</button>
			</div>
		</li>
	);
}

function ErrorMessage({ message }) {
	return (
		<p className="error">
			<span>🛑</span>
			{message}
		</p>
	);
}

export default function App() {
	const [query, setQuery] = useState('iron man');
	const [movies, setMovies] = useState([]);
	const [watched, setWatched] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [selectedId, setSelectedId] = useState(null);

	function handleSelectMovie(id) {
		setSelectedId((currId) => (currId === id ? null : id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	useEffect(
		function () {
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
					console.log(data);

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

			handleCloseMovie();
			fetchMovies();

			return function () {
				controller.abort();
			};
		},
		[query]
	);

	// setWatched([]);

	return (
		<>
			<Navbar>
				<Logo />
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</Navbar>
			<Main>
				<Box>
					{error ? (
						<ErrorMessage message={error} />
					) : isLoading ? (
						<Loader />
					) : (
						<MovieList
							movies={movies}
							onSelectMovie={handleSelectMovie}
						/>
					)}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatchedMovie={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMovieList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}
