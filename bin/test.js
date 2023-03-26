#!/usr/bin/env node
import os from 'os';
import fs from 'fs';
import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

const sshAddUser = (host) => {
	const path = os.homedir() + '/.ssh/id_rsa';

	const privateKey = fs.readFileSync(path, 'utf8');
	ssh
		.connect({
			host,
			username: 'esbot',
			privateKey,
			port: 22,
			port: 22,
			tryKeyboard: true,
			onKeyboardInteractive(
				name,
				instructions,
				instructionsLang,
				prompts,
				finish
			) {
				if (
					prompts.length > 0 &&
					prompts[0].prompt.toLowerCase().includes('password')
				) {
					finish([password]);
				}
			},
		})
		.then(() => {
			ssh.putFile('add-user', '/root/scripts/add-user').then(() => {
				console.log('add-user script copied to remote server.');
				ssh.execCommand('chmod +x /root/scripts/add-user').then(() => {
					ssh.execCommand('/root/scripts/add-user').then(() => {
						console.log('User added to remote server.');
						ssh.dispose();
					});
				});
			});
		});
};

sshAddUser('194.32.78.10');

// ssh
// 	.connect({
// 		host: '194.32.78.10',
// 		username: 'root',
// 		password: '7yD2rq9+ubNd3*$6',
// 	})
// 	.then(() => {
// 		ssh
// 			.putFile('/Users/guysha/.ssh/id_rsa.pub', '/.ssh/authorized_keys')
// 			.then(() => {
// 				console.log('SSH key copied to remote server.');

// 				ssh.mkdir('/root/scripts').then(() => {
// 					console.log('scripts directory created.');

// 					ssh.putFile('add-user', '/root/scripts/add-user').then(() => {
// 						console.log('add-user script copied to remote server.');
// 						ssh.execCommand('chmod +x /root/scripts/add-user').then(() => {
// 							console.log('add-user script made executable.');
// 							ssh
// 								.execCommand('/root/scripts/add-user')
// 								.then(() => {
// 									console.log('add-user script executed.');
// 								})
// 								.then(() => {
// 									ssh.dispose();
// 								});
// 						});
// 					});
// 				});
// 			})
// 			.catch((err) => {
// 				console.log(err);
// 			});
// 	});
