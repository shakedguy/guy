import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from './config.js';

const { secret_key, secret_iv, ecnryption_method } = config;

if (!secret_key || !secret_iv || !ecnryption_method) {
	throw new Error('secretKey, secretIV, and ecnryptionMethod are required');
}

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

const encryptData = (data) => {
	const cipher = crypto.createCipheriv(ecnryption_method, key, encryptionIV);
	return Buffer.from(
		cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
	).toString('base64');
};

const decryptData = (encryptedData) => {
	const buff = Buffer.from(encryptedData, 'base64');
	const decipher = crypto.createDecipheriv(
		ecnryption_method,
		key,
		encryptionIV
	);
	return (
		decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
		decipher.final('utf8')
	);
};

const generateHash = (msg) => {
	return crypto.createHash('sha256').update(msg).digest('hex');
};

const generateSecretKey = (length = 32) => {
	if (typeof length !== 'number') {
		return null;
	}
	return crypto.randomBytes(length).toString('base64url');
};

const encryptFile = (filePath, outputFilePath, callback) => {
	filePath = path.resolve(filePath);
	outputFilePath = path.resolve(outputFilePath);
	const input = fs.createReadStream(filePath);
	const output = fs.createWriteStream(outputFilePath);
	let cipher = crypto.createCipheriv(
		ecnryption_method,
		Buffer.from(key),
		encryptionIV
	);

	input.pipe(cipher).pipe(output);

	input.on('finish', () => {
		input.close();
	});

	input.on('close', () => {
		input.destroy();
	});

	output.on('finish', () => {
		output.close();
	});

	output.on('close', () => {
		output.destroy();
		callback();
	});
};

const decryptFile = (filePath, outputFilePath, callback) => {
	filePath = path.resolve(filePath);
	outputFilePath = path.resolve(outputFilePath);
	const input = fs.createReadStream(filePath);
	const output = fs.createWriteStream(outputFilePath);
	let decipher = crypto.createDecipheriv(
		ecnryption_method,
		Buffer.from(key),
		encryptionIV
	);

	input.pipe(decipher).pipe(output);

	input.on('finish', () => {
		input.close();
	});

	input.on('close', () => {
		input.destroy();
	});

	output.on('finish', () => {
		output.close();
	});

	output.on('close', () => {
		output.destroy();
		callback();
	});
};

export {
	decryptData,
	encryptData,
	generateHash,
	generateSecretKey,
	encryptFile,
	decryptFile,
};
