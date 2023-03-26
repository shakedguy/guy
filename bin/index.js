#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { Command } from 'commander';
import { readFile } from 'fs/promises';
import fs from 'fs';
import * as crypto from 'crypto';
import config from './config.js';

const { secret_key, secret_iv, ecnryption_method } = config;
const key = crypto
	.createHash('sha512')
	.update(secret_key)
	.digest('hex')
	.substring(0, 32);
const encryptionIV = crypto
	.createHash('sha512')
	.update(secret_iv)
	.digest('hex')
	.substring(0, 16);

const packageJson = JSON.parse(
	await readFile(new URL('../package.json', import.meta.url))
);

const { name, description, version } = packageJson;

const genpassHandler = (options, args) => {
	console.log(options.length);
};

const encryptHandler = (options, args) => {
	const input = fs.createReadStream(options.input);
	const output = fs.createWriteStream(options.output);
	let cipher = crypto.createCipheriv(
		options.algorithm,
		Buffer.from(key),
		encryptionIV
	);
	// Pipe the input stream through the cipher to the output stream
	input.pipe(cipher).pipe(output);
	// Handle the 'finish' event when the encryption is complete
	output.on('finish', () => {
		console.log('Encryption complete');
	});
};

const program = new Command();

program.name(name).description(description).version(version);

program
	.command('genpass')
	.description('Generate a password')
	.option('-l, --length <number>', 'length of the password', 10)
	.action(genpassHandler);

program
	.command('encrypt')
	.description('Encrypt a file')
	.option('-i, --input <input>', 'input file path')
	.option('-o, --output <output>', 'output file path')
	.action(encryptHandler);

program
	.command('encrypt')
	.description('Encrypt a file')
	.option('-i, --input <input>', 'input file path')
	.option('-o, --output <output>', 'output file path')
	.action(encryptHandler);

// program
// 	.command('genrsa')
// 	.description('Generate a RSA key pair')
// 	.argument('<bits>', 'Key size in bits', 4096)
// 	.option('-f, --format <format>', 'Key format', 'pem')
// 	.option('-p, --private <private>', 'Private key path', 'private.pem')
// 	.option('-u, --public <public>', 'Public key path', 'public.pem');

program.parse();
