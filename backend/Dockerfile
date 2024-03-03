FROM oven/bun:1.0.29
WORKDIR /backend
RUN apt-get update && apt-get install git -y
COPY package.json bun.lockb ./
RUN bun install
EXPOSE 3001
CMD bun run