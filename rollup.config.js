import resolve from "@rollup/plugin-node-resolve";
import babel from '@rollup/plugin-babel';
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json';

export default [
	{
		input: "src/index.tsx",
		output: [
			{
				file: pkg.main,
				format: "cjs",
				sourcemap: true,
			},
			{
				file: pkg.module,
				format: "esm",
				sourcemap: true,
			},
		],
		plugins: [
			peerDepsExternal(),
			resolve(),
			babel({
				exclude: 'node_modules/**',
				presets: ['@babel/env', '@babel/preset-react']
			}),
			typescript({ typescript: require('typescript'), tsconfig: "./tsconfig.json" }),
			commonjs(),
			postcss({
				plugins: [autoprefixer()],
				sourceMap: true,
				extract: true,
				minimize: true
			}),
			terser(),
		],
		external: [
			...Object.keys(pkg.dependencies || {}),
		]
	},
	{
		input: "dist/esm/index.js",
		output: [{ file: "dist/index.js", format: "esm" }],
		plugins: [dts()],
	},
];