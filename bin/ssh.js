import { NodeSSH } from 'node-ssh';
import os from 'os';
const ssh = new NodeSSH();

const sshCopyId = (host, password) => {
	ssh
		.connect({
			host,
			username: 'root',
			password,
		})
		.then(() => {
			const path = os.homedir() + '/.ssh/id_rsa.pub';
			ssh
				.putFile(path, '/.ssh/authorized_keys')
				.then(() => {
					console.log('SSH key copied to remote server.');
					ssh.dispose();
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			console.log(err);
		});
};

const sshAddUser = (host) => {
	const path = os.homedir() + '/.ssh/id_rsa';
	ssh
		.connect({
			host,
			username: 'root',
			privateKey: path,
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

export { sshCopyId, sshAddUser };
