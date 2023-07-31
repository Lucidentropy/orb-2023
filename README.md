# ORB-2023

This is the repo for clanorb.com, a gaming community I founded in 2000. I got into web development that same year for the sole reason of making a website for my gaming clan. It has become my career and I continue developing this site to this day as motivation and time allows.

## Technologies Used

This project was an exploration into a variety of technologies I have never used before but wanted to learn, primarily TypeScript and Svelte; please don't be surprised if you see some contrived implementations as I iterate over this project and learn optimal practices.

- **Svelte/SvelteKit**: The core of the application is built using Svelte, a modern reactive JavaScript framework, and SvelteKit, a framework for building extremely high-performance web apps.
- **TypeScript**: TypeScript, a statically typed superset of JavaScript, is used throughout the project to ensure type safety and improve IDE experience.
- **Vite**: Vite is used as the build tool for its fast and lean development experience.
- **MySQL2**: MySQL2 is used to interact with MySQL databases.
- **Webamp**: Webamp, a reimplementation of Winamp 2.9 in HTML5 and JavaScript, is used for audio playback.
- **xml2js**: xml2js is used for parsing XML data.
- **chatGTP**: chatGPT 4.0 with Recombinant AI was used heavily for assistance with code refactoring.

## Project Structure

- `src`: Contains the source code for the application.
  - `routes`: Contains the Svelte components for each route in the application.
  - `lib`: Contains various assets such as images and fonts.
  - `models`: Contains TypeScript models.
  - `store`: Contains Svelte stores.
  - `styles`: Contains CSS styles.
- `static`: Contains static files such as audio files and favicons.
- `package.json`: Defines the project's npm dependencies.

## Development Scripts

- `npm run dev`: Runs the application in development mode.
- `npm run build`: Builds the application for production.

## Contributing

I'm not expecting any pull requests at random, but should you be interested in contributing to this project, and are a member of our community, please contact me on discord.