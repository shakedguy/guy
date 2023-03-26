import fs from 'fs';
import * as afs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import forge from 'node-forge';
import axios from 'axios';

const pki = forge.pki;

const genrsa = (bits, format, privatePath, publicPath) => {
	crypto.generateKeyPair(
		'rsa',
		{
			modulusLength: bits,
			publicKeyEncoding: {
				type: 'pkcs1', // "Public Key Cryptography Standards 1"
				format: format, // Most common formatting choice
			},
			privateKeyEncoding: {
				type: 'pkcs1', // "Public Key Cryptography Standards 1"
				format: format, // Most common formatting choice
			},
		},
		(err, publicKey, privateKey) => {
			if (err) {
				console.error(err);
				return;
			}
			fs.writeFileSync(privatePath, privateKey);
			fs.writeFileSync(publicPath, publicKey);
		}
	);
};

const createDirsIfNotExists = (...dirs) => {
	dirs.forEach((dir) => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	});
};

const genKeyPair = (bits, format) => {
	return new Promise((resolve, reject) => {
		resolve(
			pki.rsa.generateKeyPair({
				bits: bits,
				workers: -1,
				function(err, keypair) {
					return keypair;
				},
			})
		);
	});
};

const genCA = async (bits, format, privatePath, publicPath, certPath) => {
	const keys = await genKeyPair(bits, format);
	const cert = pki.createCertificate();
	cert.publicKey = keys.publicKey;
	cert.serialNumber = '01';
	cert.validity.notBefore = new Date();
	cert.validity.notAfter = new Date();
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
	const response = await axios.get('https://api.ipify.org?format=json');
	const ip = response.data.ip;
	const attrs = [
		{
			name: 'commonName',
			value: ip,
		},
		{
			name: 'countryName',
			value: 'IL',
		},
		{
			shortName: 'ST',
			value: 'Tel-Aviv',
		},
	];
	cert.setSubject(attrs);
	cert.setIssuer(attrs);
	cert.sign(keys.privateKey);
	const pem = pki.certificateToPem(cert);
	const privatePemKey = pki.privateKeyToPem(keys.privateKey);
	const publicPemKey = pki.publicKeyToPem(keys.publicKey);

	privatePath = path.resolve(privatePath);
	publicPath = path.resolve(publicPath);
	certPath = path.resolve(certPath);

	createDirsIfNotExists(
		path.dirname(privatePath),
		path.dirname(publicPath),
		path.dirname(certPath)
	);

	await Promise.all([
		afs.writeFile(privatePath, privatePemKey),
		afs.writeFile(publicPath, publicPemKey),
		afs.writeFile(certPath, pem),
	]);
};

const genCert = async (bits, format, privatePath, publicPath, certPath) => {
	const keys = await genKeyPair(bits, format);
	const cert = pki.createCertificate();
	cert.publicKey = keys.publicKey;
	cert.serialNumber = '01';
	cert.validity.notBefore = new Date();
	cert.validity.notAfter = new Date();
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
	const response = await axios.get('https://api.ipify.org?format=json');
	const ip = response.data.ip;
	const attrs = [
		{
			name: 'commonName',
			value: ip,
		},
		{
			name: 'countryName',
			value: 'IL',
		},
		{
			shortName: 'ST',
			value: 'Tel-Aviv',
		},
	];
	cert.setSubject(attrs);
	cert.setIssuer(attrs);
	const caPrivateKey = pki.privateKeyFromPem(
		fs.readFileSync('../ca/private.pem')
	);
	cert.sign(caPrivateKey);
	const pem = pki.certificateToPem(cert);
	const privatePemKey = pki.privateKeyToPem(keys.privateKey);
	const publicPemKey = pki.publicKeyToPem(keys.publicKey);

	privatePath = path.resolve(privatePath);
	publicPath = path.resolve(publicPath);
	certPath = path.resolve(certPath);

	createDirsIfNotExists(
		path.dirname(privatePath),
		path.dirname(publicPath),
		path.dirname(certPath)
	);

	await Promise.all([
		afs.writeFile(privatePath, privatePemKey),
		afs.writeFile(publicPath, publicPemKey),
		afs.writeFile(certPath, pem),
	]);

	pki.ca;
};

export { genrsa, genCA, genCert };
