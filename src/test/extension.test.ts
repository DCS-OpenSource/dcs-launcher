import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getDcsLogPath } from '../dcsLogView';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Builds the default DCS log path', () => {
		assert.strictEqual(
			getDcsLogPath('C:\\Users\\Pilot'),
			'C:\\Users\\Pilot\\Saved Games\\DCS\\Logs\\dcs.log'
		);
	});

	test('Uses the configured DCS log path when provided', () => {
		assert.strictEqual(
			getDcsLogPath('C:\\Users\\Pilot', 'C:\\DCS Logs\\custom.log'),
			'C:\\DCS Logs\\custom.log'
		);
	});

	test('Registers the open log command', async () => {
		const extension = vscode.extensions.getExtension('DCS-OpenSource.dcs-launcher');
		assert.ok(extension);
		await extension.activate();

		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('dcsLauncher.openLog'));
	});

	test('Provides the default noisy log exclusion', () => {
		const config = vscode.workspace.getConfiguration('dcsLauncher');
		const patterns = config.inspect<string[]>('logExcludedPatterns');

		assert.deepStrictEqual(patterns?.defaultValue, [
			'negative (drag|weight) of payload'
		]);
	});

	test('Leaves the default log file setting empty', () => {
		const config = vscode.workspace.getConfiguration('dcsLauncher');
		const logFilePath = config.inspect<string>('logFilePath');

		assert.strictEqual(logFilePath?.defaultValue, '');
	});
});
