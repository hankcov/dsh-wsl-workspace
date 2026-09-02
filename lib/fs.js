import { a as isAbsoluteLinuxPath, c as joinUnc, d as parseWslUnc, f as windowsToMntPath, l as mntToWindowsPath, n as defaultDistroSync } from "./wsl-qwxCKU5O.js";
import { t as MAX_TIMER_DELAY_MS } from "./lib-CFXc-Yau.js";
import { createRequire } from "node:module";
import z from "@deepseek-ai/schemastery";
import { createReadStream } from "node:fs";
import { pathToFileURL } from "node:url";
import { basename, dirname, isAbsolute, join, relative, resolve, sep, toNamespacedPath } from "node:path";
import { TextDecoder } from "node:util";
import { chmod, link, lstat, mkdir, open, readFile, readdir, realpath, rename, rm, stat } from "node:fs/promises";
import { Service } from "@deepseek-ai/cordis";
import { AsyncLocalStorage } from "node:async_hooks";
import { constants } from "node:buffer";
import { randomUUID } from "node:crypto";
//#region node_modules/.pnpm/@deepseek-ai+dsh-llm@0.0.1-rc.1_@deepseek-ai+cordis@4.0.2_@deepseek-ai+dsh-attachment@0_5745f88aaf8ad72b54a52d9c68fc4c4f/node_modules/@deepseek-ai/dsh-llm/lib/index.js
/**
* Harness error base with a stable machine-routable code and chained cause.
* Package errors extend it so tool results and replay can retain failure class.
* @module @deepseek-ai/dsh-llm/error
*/
/**
* Base class for all harness errors. Carries a `code` (stable, programmatic —
* e.g. `NO_ADAPTER`, `INVALID_ARGS`, `INVARIANT`) distinct from the
* human-readable `message`, and supports `cause` chaining via the standard
* `ErrorOptions`. `name` defaults to the subclass constructor name.
*/
var HarnessError = class extends Error {
	/** Stable machine-routable failure class (e.g. `RATE_LIMIT`); route on this, never by parsing `message`. */
	code;
	constructor(message, code, options) {
		super(message, options);
		this.code = code;
		this.name = new.target.name;
	}
};
/**
* Canonical provider-neutral code for a response that completed normally but
* carried no content blocks at all. Providers occasionally emit a degenerate
* completion (a terminal stop with zero output); adapters classify it as this
* failure instead of yielding an empty assistant message, because an empty
* message silently ends the turn with nothing for the user or the loop to act
* on. The attempt produced nothing durable, so retry policy treats it as safe
* to repeat.
*/
const EMPTY_RESPONSE_CODE = "EMPTY_RESPONSE";
new RegExp(String.raw`(?:^|[^a-z0-9])context[\s_-](?:length|window)[\s_-]` + String.raw`(?:exceed(?:ed|s)?|overflow(?:ed)?|limit[\s_-]exceeded)(?:$|[^a-z0-9])`, "i");
new RegExp(String.raw`\b(?:request|prompt|input|messages?)\s+(?:is\s+|are\s+)?` + String.raw`too\s+(?:large|long)\s+for\s+(?:(?:this|the)\s+)?` + String.raw`(?:model(?:'s)?\s+)?context(?:\s+window)?\b`, "i");
new RegExp(String.raw`\b(?:input|prompt|request|messages?)\b.{0,40}` + String.raw`\b(?:exceed(?:s|ed)?|overflows?|is\s+larger\s+than)\b.{0,40}` + String.raw`\b(?:the\s+)?(?:model(?:'s)?\s+)?context(?:\s+(?:length|window))?\b`, "i");
/**
* Provider-owned request-retry policy configuration and resolution.
*
* Adapters expose one resolved policy per registered provider route; the
* optional dsh-llm-retry plugin executes it on the agent's failed-step extension point.
*
* @module @deepseek-ai/dsh-llm/retry-policy
*/
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_INITIAL_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 1e4;
const DEFAULT_JITTER_RATIO = .1;
const DEFAULT_RETRYABLE_CODES = Object.freeze([
	EMPTY_RESPONSE_CODE,
	"RATE_LIMIT",
	"SERVER",
	"TIMEOUT",
	"TRANSPORT"
]);
const backoffSchema = z.object({
	initialDelayMs: z.number().max(MAX_TIMER_DELAY_MS).default(DEFAULT_INITIAL_DELAY_MS),
	maxDelayMs: z.number().max(MAX_TIMER_DELAY_MS).default(DEFAULT_MAX_DELAY_MS),
	jitterRatio: z.number().min(0).max(1).default(DEFAULT_JITTER_RATIO)
});
const normalPolicySchema = z.object({
	mode: z.const("normal").required(),
	maxRetries: z.number().step(1).min(0).max(Number.MAX_SAFE_INTEGER).default(DEFAULT_MAX_RETRIES),
	retryableCodes: z.array(z.string()).default([...DEFAULT_RETRYABLE_CODES]),
	backoff: backoffSchema
});
const alwaysPolicySchema = z.object({
	mode: z.const("always").required(),
	backoff: backoffSchema
});
z.union([normalPolicySchema, alwaysPolicySchema]);
/**
* Centralize the non-secret product identity every provider request sends as `User-Agent`, keeping
* adapters from drifting. See
* `.agents/notes/implemented/architecture/2026-06-21-mandatory-app-attribution-headers.md`.
*
* App-attribution vocabulary for provider requests.
* @module @deepseek-ai/dsh-llm/attribution
*/
const { version } = createRequire(import.meta.url)("../package.json");
//#endregion
//#region node_modules/.pnpm/@deepseek-ai+dsh-fs@0.0.1-rc.1_4538991977407044715e141af1416b6c/node_modules/@deepseek-ai/dsh-fs/lib/index.js
/**
* Vocabulary for the filesystem Service Definition (`ctx.fs`): the opaque target/version
* identities, the metadata `stat` returns, the write-intent and outcome shapes, the
* literal-edit request/outcome, and the typed error taxonomy.
* @module @deepseek-ai/dsh-fs/types
*/
/**
* Brand a string as an {@link FsTargetKey}. For backend use only — a consumer
* never manufactures a key, it receives one from `resolve()`.
* @param key - the backend's raw key string (the local backend passes a realpath).
* @returns the same string, branded; no validation is performed.
*/
function FsTargetKey(key) {
	return key;
}
/**
* Brand a string as an {@link FsVersion}. For backend use only — a consumer
* never manufactures a version, it receives one from `stat`/write/edit outcomes.
* @param v - the backend's raw version string.
* @returns the same string, branded; no validation is performed.
*/
function FsVersion(v) {
	return v;
}
/**
* Typed filesystem error. Extends {@link HarnessError} so it carries a stable
* {@link FsErrorCode} and chains `cause`. `dsh-fs` owns this vocabulary so
* backends and the policy layer raise the same codes instead of each inventing
* message strings.
*/
var FsError = class extends HarnessError {
	code;
	constructor(message, code, options) {
		super(message, code, options);
		this.code = code;
	}
};
/**
* Filesystem Service Definition for one execution world. Backends own stable target
* identity, process paths and file URIs, containment, text reads, decoding,
* binary rejection, and atomic mutations. Read windows and
* observed-state policy stay in consumer and policy plugins; `editText`
* remains here so version check, literal match, and rewrite share one critical
* section.
* @module @deepseek-ai/dsh-fs
*/
/**
* Abstract filesystem provider. Targets must preserve identity across aliases;
* reads expose regular UTF-8 text or typed errors, listings are stable and
* content-free, and mutations are atomic. Optional guards add stale protection
* without changing the unguarded provider contract.
*/
var FileSystem = class extends Service {
	constructor(ctx) {
		super(ctx, "fs");
	}
	/**
	* The sandbox mode this backend enforces on mutations BY DEFAULT, or
	* `undefined` when it does not confine at all — the capability fact the tool
	* layer reads to advertise the escalation fields honestly (mirrors
	* `BashExecutor.sandboxMode`). The base class and the bare local backend
	* report `undefined`; a sandboxing backend (`@deepseek-ai/dsh-fs-sandbox`)
	* overrides it with the deployment default. A session override may make the
	* effective mode narrower or wider, so strict escalation widening is checked
	* per call rather than encoded in this default-relative fact.
	* @returns the configured default mode of a sandboxing backend; `undefined`
	*   for a backend that never confines.
	*/
	get sandboxMode() {}
};
//#endregion
//#region node_modules/.pnpm/@deepseek-ai+dsh-fs-local@0.0.1-rc.1_@deepseek-ai+cordis@4.0.2_@deepseek-ai+dsh-fs@0.0._c2aeabf34e7274f08b456626a3414f03/node_modules/@deepseek-ai/dsh-fs-local/lib/index.js
/**
* Windows security-descriptor helpers for atomic local-file replacement. Koffi loads lazily so
* non-Windows processes never open Win32 libraries.
* @module @deepseek-ai/dsh-fs-local/win32
*/
const DACL_SECURITY_INFORMATION = 4;
const ERROR_FILE_NOT_FOUND = 2;
const ERROR_PATH_NOT_FOUND = 3;
const ERROR_ACCESS_DENIED = 5;
let bindings;
async function win32() {
	if (bindings !== void 0) return bindings;
	const koffi = (await import("./koffi-BPMn9kHG.js")).default;
	const advapi32 = koffi.load("advapi32.dll");
	const kernel32 = koffi.load("kernel32.dll");
	bindings = {
		getFileSecurityW: advapi32.func("int __stdcall GetFileSecurityW(const char16_t *path, uint32_t requested, void *descriptor, uint32_t length, _Out_ uint32_t *needed)"),
		setFileSecurityW: advapi32.func("int __stdcall SetFileSecurityW(const char16_t *path, uint32_t information, const void *descriptor)"),
		replaceFileW: kernel32.func("int __stdcall ReplaceFileW(const char16_t *replaced, const char16_t *replacement, const char16_t *backup, uint32_t flags, void *exclude, void *reserved)"),
		getLastError: kernel32.func("uint32_t __stdcall GetLastError()")
	};
	return bindings;
}
function errnoCode(win32Code) {
	switch (win32Code) {
		case ERROR_FILE_NOT_FOUND:
		case ERROR_PATH_NOT_FOUND: return "ENOENT";
		case ERROR_ACCESS_DENIED: return "EACCES";
		default: return "EIO";
	}
}
function win32Error(syscall, win32Code, path) {
	const code = errnoCode(win32Code);
	const error = /* @__PURE__ */ new Error(`${syscall} ${code} (Win32 ${win32Code}): ${path}`);
	error.code = code;
	error.errno = win32Code;
	error.syscall = syscall;
	error.path = path;
	error.win32Code = win32Code;
	return error;
}
/**
* Read a file's self-relative DACL security descriptor.
* @param path - existing file whose DACL is read.
* @returns a descriptor buffer accepted by `SetFileSecurityW`.
*/
async function readFileDaclWin32(path) {
	const api = await win32();
	const nativePath = toNamespacedPath(path);
	const needed = [0];
	api.getFileSecurityW(nativePath, DACL_SECURITY_INFORMATION, null, 0, needed);
	if (needed[0] === 0) throw win32Error("GetFileSecurityW", api.getLastError(), path);
	const descriptor = Buffer.alloc(needed[0]);
	if (api.getFileSecurityW(nativePath, DACL_SECURITY_INFORMATION, descriptor, descriptor.length, needed) === 0) throw win32Error("GetFileSecurityW", api.getLastError(), path);
	return descriptor.subarray(0, needed[0]);
}
/**
* Copy an existing file's DACL onto another file and protect it from staging-parent inheritance.
* The destination must still be empty when confidentiality depends on this call.
* @param source - existing file whose DACL is copied.
* @param destination - existing file that receives the protected DACL.
*/
async function copyFileDaclWin32(source, destination) {
	const descriptor = await readFileDaclWin32(source);
	const api = await win32();
	if (api.setFileSecurityW(toNamespacedPath(destination), 2147483652, descriptor) === 0) throw win32Error("SetFileSecurityW", api.getLastError(), destination);
}
/**
* Replace a Windows file while preserving the replaced file's ACL and other replace metadata.
* @param replaced - existing destination file.
* @param replacement - closed staging file on the same volume.
*/
async function replaceFileWin32(replaced, replacement) {
	const api = await win32();
	if (api.replaceFileW(toNamespacedPath(replaced), toNamespacedPath(replacement), null, 0, null, null) === 0) throw win32Error("ReplaceFileW", api.getLastError(), replaced);
}
/**
* Cordis-free local filesystem mechanics. This provider layer returns validated UTF-8 text,
* streams large files, and rejects binary data; line windows belong to `dsh-tool-fs`. Writes
* stage an exclusive owner-only file in a private sibling directory and atomically publish it.
* @module @deepseek-ai/dsh-fs-local/fsio
*/
const BINARY_SAMPLE_BYTES = 8192;
const DIFF_BASIS_READ_CHUNK_BYTES = 65536;
function isENOENT(error) {
	return error instanceof Error && "code" in error && error.code === "ENOENT";
}
function isEEXIST(error) {
	return error instanceof Error && "code" in error && error.code === "EEXIST";
}
/**
* A path component that is expected to be a directory is a regular file (e.g.
* resolving `afile/child.txt` when `afile` is a file). Like `ENOENT`, the target
* cannot exist — so the resolution/probe paths treat it as "absent" rather than
* letting a raw Node error escape without the structured `FsError` taxonomy.
*/
function isENOTDIR(error) {
	return error instanceof Error && "code" in error && error.code === "ENOTDIR";
}
function isAbortError(error) {
	return error instanceof Error && error.name === "AbortError";
}
/* v8 ignore start -- composes secondary cleanup-failure messages, which require a filesystem/kernel fault after the primary failure. */
function errorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
/* v8 ignore stop */
function isPermissionError(error) {
	return error instanceof Error && "code" in error && (error.code === "EACCES" || error.code === "EPERM");
}
function throwIfAborted(signal, verb) {
	if (signal?.aborted) throw new FsError(`${verb} aborted`, "FS_ABORTED");
}
/**
* `readFile` with the supplied signal, translating a mid-read `AbortError` into
* the seam's structured `FsError('FS_ABORTED')` (Node rejects an aborted
* `readFile` with a bare `AbortError`, which would otherwise escape the seam's
* error taxonomy — the streaming/write paths translate it the same way).
*/
async function readFileAbortable(absolutePath, verb, signal) {
	try {
		return await readFile(absolutePath, signal ? { signal } : {});
	} catch (error) {
		/* v8 ignore next 2 -- a non-abort readFile rejection needs a permission/IO fault racing an open file. */
		if (!isAbortError(error)) throw error;
		throw new FsError(`${verb} aborted`, "FS_ABORTED");
	}
}
/** Opaque version token from high-resolution identity and freshness metadata. */
function versionOf(info) {
	return FsVersion(`${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}`);
}
/**
* Resolve a path to its absolute display path and realpath identity. For a missing target,
* realpath the nearest existing ancestor and append the missing suffix, preserving identity
* across symlinked ancestors before and after creation.
* @param cwd - base directory a relative `path` resolves against.
* @param path - absolute or relative path; empty/whitespace-only throws `FS_NOT_FOUND`.
* @returns the absolute display path plus the realpath-derived stable target key.
*/
async function resolveLocalTarget(cwd, path) {
	if (path.trim().length === 0) throw new FsError("file_path must be a non-empty string", "FS_NOT_FOUND");
	const displayPath = resolve(cwd, path);
	try {
		return {
			displayPath,
			targetKey: FsTargetKey(await realpath(displayPath))
		};
	} catch (error) {
		/* v8 ignore next -- Windows reports this case as ENOENT and repairs it in the ancestor walk below. */
		if (isENOTDIR(error)) throw new FsError(`cannot resolve "${displayPath}": a parent path segment is not a directory`, "FS_NOT_FOUND");
		/* v8 ignore next -- non-ENOENT realpath failure needs a permission/IO fault; ENOENT falls through to ancestor resolution. */
		if (!isENOENT(error)) throw error;
	}
	const missing = [basename(displayPath)];
	let ancestor = dirname(displayPath);
	while (true) try {
		const realAncestor = await realpath(ancestor);
		/* v8 ignore start -- native Windows coverage exercises this repair; POSIX reports ENOTDIR before this point. */
		if (process.platform === "win32") {
			if (!(await stat(realAncestor)).isDirectory()) throw new FsError(`cannot resolve "${displayPath}": a parent path segment is not a directory`, "FS_NOT_FOUND");
		}
		/* v8 ignore stop */
		return {
			displayPath,
			targetKey: FsTargetKey(join(realAncestor, ...missing))
		};
	} catch (error) {
		/* v8 ignore next -- native Windows coverage exercises the FsError raised by the repair above. */
		if (error instanceof FsError) throw error;
		/* v8 ignore next -- a non-ENOENT realpath failure needs a permission/IO fault. */
		if (!isENOENT(error)) throw error;
		const parent = dirname(ancestor);
		/* v8 ignore next -- the filesystem root always realpaths, so the walk terminates before parent === ancestor. */
		if (parent === ancestor) return {
			displayPath,
			targetKey: FsTargetKey(displayPath)
		};
		missing.unshift(basename(ancestor));
		ancestor = parent;
	}
}
function pathType(info) {
	if (info.isFile()) return "file";
	/* v8 ignore else -- Windows has no special-entry fixture for the non-directory branch. */
	if (info.isDirectory()) return "directory";
	/* v8 ignore next -- the corresponding special-entry return is covered on POSIX. */
	return "other";
}
function pathLinkType(info) {
	if (info.isSymbolicLink()) return "symlink";
	return pathType(info);
}
async function probeStats(absolutePath, readStats) {
	try {
		return await readStats(absolutePath);
	} catch (error) {
		/* v8 ignore next -- a non-ENOENT/ENOTDIR metadata failure needs a permission/IO fault; surface it. */
		if (!isENOENT(error) && !isENOTDIR(error)) throw error;
		return null;
	}
}
/**
* Probe a path for its version, mode, type, and size. Null if absent.
* @param absolutePath - the path to stat (typically a target key; symlinks are followed).
* @returns the metadata, or null when the path — or a parent segment — does not exist.
*/
async function probe(absolutePath) {
	const info = await probeStats(absolutePath, (path) => stat(path, { bigint: true }));
	if (!info) return null;
	return {
		version: versionOf(info),
		mode: Number(info.mode & 511n),
		type: pathType(info),
		size: Number(info.size)
	};
}
/**
* Probe a path without following the final symlink component.
* @param absolutePath - the path entry to inspect with `lstat` semantics.
* @returns path-entry metadata, or null when the entry is absent.
*/
async function probeNoFollow(absolutePath) {
	const info = await probeStats(absolutePath, (path) => lstat(path, { bigint: true }));
	if (!info) return null;
	return {
		version: versionOf(info),
		mode: Number(info.mode & 511n),
		type: pathLinkType(info),
		size: Number(info.size)
	};
}
function listingIoError(displayPath, error) {
	/* v8 ignore next -- defensive pass-through for races where a child resolver has already produced a structured FsError. */
	if (error instanceof FsError) return error;
	/* v8 ignore next -- requires the listed target/parent to disappear between successful preflight and listing/child resolution. */
	if (isENOENT(error) || isENOTDIR(error)) return new FsError(`cannot list "${displayPath}": not found`, "FS_NOT_FOUND", { cause: error });
	/* v8 ignore next -- Windows chmod does not deny directory listing; POSIX covers permission translation. */
	if (isPermissionError(error)) return new FsError(`cannot list "${displayPath}": permission denied`, "FS_PERMISSION_DENIED", { cause: error });
	return new FsError(`cannot list "${displayPath}": ${errorMessage(error)}`, "FS_IO_ERROR", { cause: error });
}
async function resolveListedChildTarget(parent, name) {
	const identity = await resolveLocalTarget(parent.targetKey, name);
	return {
		displayPath: join(parent.displayPath, name),
		targetKey: identity.targetKey
	};
}
/**
* List direct children of a directory in stable name order. Each child includes
* a resolved target plus stat metadata when still available; file contents are
* never read.
* @param target - the resolved directory to list; a missing or non-directory target throws.
* @param signal - aborts the listing, checked between children (`FS_ABORTED`).
* @returns one entry per direct child, sorted by name.
*/
async function listDirectory(target, signal) {
	throwIfAborted(signal, "list");
	let info;
	try {
		info = await probe(target.targetKey);
	} catch (error) {
		throw listingIoError(target.displayPath, error);
	}
	if (!info) throw new FsError(`cannot list "${target.displayPath}": not found`, "FS_NOT_FOUND");
	if (info.type !== "directory") throw new FsError(`cannot list "${target.displayPath}": not a directory`, "FS_NOT_DIRECTORY");
	let entries;
	try {
		entries = await readdir(target.targetKey, {
			withFileTypes: true,
			encoding: "utf8"
		});
	} catch (error) {
		/* v8 ignore next -- requires permission/kernel failure from readdir after a successful directory stat. */
		throw listingIoError(target.displayPath, error);
	}
	throwIfAborted(signal, "list");
	const result = [];
	for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
		throwIfAborted(signal, "list");
		try {
			const childTarget = await resolveListedChildTarget(target, entry.name);
			const childInfo = await probe(childTarget.targetKey);
			result.push({
				name: entry.name,
				type: childInfo?.type ?? "other",
				target: childTarget,
				...childInfo ? { version: childInfo.version } : {},
				...childInfo?.type === "file" ? { size: childInfo.size } : {}
			});
		} catch (error) {
			throw listingIoError(join(target.displayPath, entry.name), error);
		}
		throwIfAborted(signal, "list");
	}
	return result;
}
function notTextError(verb, displayPath) {
	return new FsError(`cannot ${verb} "${displayPath}": invalid UTF-8 text`, "FS_NOT_TEXT");
}
function decodeUtf8(buffer, verb, displayPath) {
	try {
		return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
	} catch (error) {
		/* v8 ignore next 2 -- TextDecoder({fatal}) only throws TypeError on invalid bytes; any other throw is an unreachable runtime fault. */
		if (!(error instanceof TypeError)) throw error;
		throw notTextError(verb, displayPath);
	}
}
function decodeUtf8Stream(decoder, chunk, verb, displayPath) {
	try {
		return chunk ? decoder.decode(chunk, { stream: true }) : decoder.decode();
	} catch (error) {
		/* v8 ignore next 2 -- TextDecoder({fatal}) only throws TypeError on invalid bytes; any other throw is an unreachable runtime fault. */
		if (!(error instanceof TypeError)) throw error;
		throw notTextError(verb, displayPath);
	}
}
async function statRegularFile(target, verb, signal) {
	throwIfAborted(signal, verb);
	let info;
	try {
		info = await stat(target.targetKey);
	} catch (error) {
		/* v8 ignore next 2 -- a non-ENOENT stat failure needs a permission/IO fault; only the not-found path is reachable in tests. */
		if (!isENOENT(error)) throw error;
		throw new FsError(`cannot ${verb} "${target.displayPath}": not found`, "FS_NOT_FOUND");
	}
	if (!info.isFile()) throw new FsError(`cannot ${verb} "${target.displayPath}": not a regular file`, "FS_NOT_REGULAR_FILE");
	return info;
}
/**
* Read a whole regular UTF-8 text file into a single decoded string. Rejects
* non-regular files, invalid UTF-8, and NUL-byte binary samples.
* @param target - the resolved file to read.
* @param signal - aborts the read (`FS_ABORTED`).
* @returns the full decoded text, byte-for-byte (no normalization).
*/
async function readWholeText(target, signal) {
	await statRegularFile(target, "read", signal);
	const raw = await readFileAbortable(target.targetKey, "read", signal);
	throwIfAborted(signal, "read");
	if (raw.subarray(0, BINARY_SAMPLE_BYTES).includes(0)) throw new FsError(`cannot read "${target.displayPath}": binary file`, "FS_NOT_TEXT");
	return decodeUtf8(raw, "read", target.displayPath);
}
/**
* Stream a whole regular UTF-8 text file as decoded text chunks. Same text
* semantics as {@link readWholeText} (regular-file check, binary/NUL rejection,
* cross-chunk UTF-8 decoding), but never holds the whole file in memory.
* @param target - the resolved file to stream.
* @param signal - aborts the stream, including between chunks (`FS_ABORTED`).
* @returns decoded text chunks in file order; chunk boundaries carry no meaning.
*/
async function* streamWholeText(target, signal) {
	await statRegularFile(target, "read", signal);
	const stream = createReadStream(target.targetKey, signal ? { signal } : {});
	const decoder = new TextDecoder("utf-8", { fatal: true });
	let sampledBytes = 0;
	function scanBinarySample(chunk) {
		if (sampledBytes >= BINARY_SAMPLE_BYTES) return;
		const sample = chunk.subarray(0, Math.min(chunk.length, BINARY_SAMPLE_BYTES - sampledBytes));
		if (sample.includes(0)) throw new FsError(`cannot read "${target.displayPath}": binary file`, "FS_NOT_TEXT");
		sampledBytes += sample.length;
	}
	try {
		for await (const chunk of stream) {
			scanBinarySample(chunk);
			yield decodeUtf8Stream(decoder, chunk, "read", target.displayPath);
		}
		yield decodeUtf8Stream(decoder, void 0, "read", target.displayPath);
	} catch (error) {
		/* v8 ignore next 4 -- mid-stream errors need an abort/IO fault racing the loop; pre-abort is caught by throwIfAborted. */
		if (isAbortError(error)) throw new FsError("read aborted", "FS_ABORTED");
		throw error;
	}
}
async function removeStagingDirOrThrow(stagingDir, originalError, removeStagingDir) {
	try {
		await removeStagingDir(stagingDir);
	} catch (cleanupError) {
		/* v8 ignore next 1 -- cleanup failure here needs a second filesystem fault after the primary write failure. */
		throw new FsError(`write failed (${errorMessage(originalError)}) and temp cleanup failed (${errorMessage(cleanupError)})`, "FS_NOT_FOUND", { cause: originalError });
	}
	throw originalError;
}
async function throwGuardedCreateFailure(error, absolutePath, displayPath, inspectPublicationTarget) {
	let existing;
	try {
		existing = await inspectPublicationTarget(absolutePath);
	} catch (metadataError) {
		if (!isENOENT(metadataError) && !isENOTDIR(metadataError)) throw new FsError(`cannot write "${displayPath}": ${errorMessage(metadataError)}`, "FS_IO_ERROR", { cause: metadataError });
	}
	if (existing !== void 0) {
		if (!existing.isFile()) throw new FsError(`cannot write "${displayPath}": not a regular file`, "FS_NOT_REGULAR_FILE", { cause: error });
		throw new FsError(`cannot overwrite existing "${displayPath}" without reading it first`, "FS_NOT_OBSERVED", { cause: error });
	}
	if (isEEXIST(error)) throw new FsError(`cannot overwrite existing "${displayPath}" without reading it first`, "FS_NOT_OBSERVED", { cause: error });
	throw new FsError(`cannot write "${displayPath}": ${errorMessage(error)}`, "FS_IO_ERROR", { cause: error });
}
/**
* Atomically replace a file through a private, synced staging file in the same directory.
* POSIX protects the staging directory and file with `0o700` and `0o600`. A new Windows file
* inherits the destination directory's DACL; a replacement copies the existing target's DACL
* onto the empty temp before writing and preserves the target descriptor at publication.
* @param absolutePath - destination; missing parent directories are created.
* @param content - the full UTF-8 text to write.
* @param mode - existing destination's POSIX mode to preserve, or `undefined` for a new file;
* inert as a mode on Windows but identifies replacement security semantics.
* @param signal - cancellation checked before final publication.
* @param internals - Test hook for pinning temp names and observing the staged file.
* @param createIfAbsent - when provided, publish with a hard-link no-replace
* primitive; a concurrent creator's file is preserved and this write is
* rejected with `FS_NOT_OBSERVED` using the supplied display path.
*/
async function writeFileAtomic(absolutePath, content, mode, signal, internals = {}, createIfAbsent) {
	throwIfAborted(signal, "write");
	const directory = dirname(absolutePath);
	await mkdir(directory, { recursive: true });
	throwIfAborted(signal, "write");
	const stagingDir = join(directory, internals.tempDirName?.(absolutePath) ?? `.${basename(absolutePath)}.${process.pid}.${randomUUID()}.tmpdir`);
	const tempPath = join(stagingDir, internals.tempName?.(absolutePath) ?? `${basename(absolutePath)}.tmp`);
	const platform = internals.platform ?? process.platform;
	const copyFileDacl = internals.copyFileDacl ?? copyFileDaclWin32;
	const replaceFile = internals.replaceFile ?? replaceFileWin32;
	const linkFile = internals.linkFile ?? link;
	const inspectPublicationTarget = internals.inspectPublicationTarget ?? ((path) => lstat(path, { bigint: true }));
	const removeStagingDir = internals.removeStagingDir ?? ((path) => rm(path, {
		recursive: true,
		force: true
	}));
	let handle;
	let stagingCreated = false;
	try {
		await mkdir(stagingDir, { mode: 448 });
		stagingCreated = true;
		await chmod(stagingDir, 448);
		handle = await open(tempPath, "wx", 384);
		await handle.chmod(384);
		if (platform === "win32" && mode !== void 0) await copyFileDacl(absolutePath, tempPath);
		await handle.writeFile(content, {
			encoding: "utf8",
			...signal ? { signal } : {}
		});
		await handle.sync();
		await internals.inspectTemp?.({
			stagingDir,
			tempPath
		});
		if (mode !== void 0) await handle.chmod(mode);
		await handle.close();
		handle = void 0;
		throwIfAborted(signal, "write");
		if (createIfAbsent !== void 0) try {
			await linkFile(tempPath, absolutePath);
		} catch (error) {
			await throwGuardedCreateFailure(error, absolutePath, createIfAbsent.displayPath, inspectPublicationTarget);
		}
		else if (platform === "win32" && mode !== void 0) try {
			await replaceFile(absolutePath, tempPath);
		} catch (error) {
			if (!isENOENT(error)) throw error;
			await rename(tempPath, absolutePath);
		}
		else await rename(tempPath, absolutePath);
		try {
			await removeStagingDir(stagingDir);
		} catch (_committedStagingCleanupFailure) {}
	} catch (error) {
		/* v8 ignore next -- abort-mid-write needs a writeFile/signal race; the non-abort (rename/open) side is tested. */
		let failure = isAbortError(error) ? new FsError("write aborted", "FS_ABORTED") : error;
		/* v8 ignore next 8 -- reached only if writeFile/sync throws with the handle open (IO fault); close-failure is a double fault. */
		if (handle) try {
			await handle.close();
		} catch (closeError) {
			failure = new FsError(`write failed (${errorMessage(failure)}) and temp close failed (${errorMessage(closeError)})`, "FS_NOT_FOUND", { cause: failure });
		}
		if (!stagingCreated) throw failure;
		return removeStagingDirOrThrow(stagingDir, failure, removeStagingDir);
	}
}
/**
* Collapse CRLF to LF — the canonical in-memory form every edit/diff basis
* uses. Lone `\r` bytes (not followed by `\n`) are left untouched.
* @param content - decoded text in whatever line-ending style the file had.
* @returns the text with every `\r\n` pair replaced by `\n`.
*/
function normalizeLineEndings(content) {
	return content.replaceAll("\r\n", "\n");
}
function detectLineEndings(raw) {
	const sample = raw.slice(0, 4096);
	const crlfCount = sample.split("\r\n").length - 1;
	return crlfCount > sample.split("\n").length - 1 - crlfCount ? "CRLF" : "LF";
}
/**
* Convert LF-normalized content back to the line-ending style detected at read
* time, for write-back. `LF` returns the content unchanged; `CRLF` re-normalizes
* first so an already-CRLF sequence is never doubled to `\r\r\n`.
* @param content - the LF-normalized (edited) text.
* @param lineEndings - the original file's style, as detected by {@link readForEdit}.
* @returns the text in the original file's line-ending style.
*/
function restoreLineEndings(content, lineEndings) {
	return lineEndings === "LF" ? content : normalizeLineEndings(content).split("\n").join("\r\n");
}
function countOccurrences(content, needle) {
	let count = 0;
	let index = 0;
	while (true) {
		const found = content.indexOf(needle, index);
		if (found === -1) return count;
		count += 1;
		index = found + needle.length;
	}
}
/**
* Read and decode a file for editing: rejects binaries, returns LF-normalized
* content plus the original line-ending style for write-back.
* @param absolutePath - the file to read (typically a target key).
* @param displayPath - the caller-facing path used in error messages.
* @param signal - aborts the read (`FS_ABORTED`).
* @returns the LF-normalized content and the detected style to restore on write-back.
*/
async function readForEdit(absolutePath, displayPath, signal) {
	throwIfAborted(signal, "edit");
	const buffer = await readFileAbortable(absolutePath, "edit", signal);
	throwIfAborted(signal, "edit");
	if (buffer.includes(0)) throw new FsError(`cannot edit "${displayPath}": binary file`, "FS_NOT_TEXT");
	const raw = decodeUtf8(buffer, "edit", displayPath);
	return {
		content: normalizeLineEndings(raw),
		lineEndings: detectLineEndings(raw)
	};
}
/**
* Best-effort overwrite diff basis. Binary, invalid UTF-8, a file at/above the byte limit,
* or a file deleted/made unreadable after the caller's preflight returns `null` so the write
* still succeeds and presentation falls back to a whole-file diff. The bound is enforced on
* the opened descriptor rather than a prior path stat, so concurrent external replacement or
* size changes cannot make this helper buffer more than `maxBytes`.
* @param absolutePath - the file to read (typically a target key).
* @param maxBytes - exclusive upper bound for bytes held as the contextual-diff basis.
* @param signal - aborts the read (`FS_ABORTED`); cancellation propagates, unlike I/O failure.
* @returns the LF-normalized text, or null for a non-regular, at/above-limit, binary, non-UTF-8,
* descriptor-size-changed, or unreadable file.
*/
async function readTextForDiff(absolutePath, maxBytes, signal) {
	throwIfAborted(signal, "read");
	try {
		const handle = await open(absolutePath, "r");
		let buffer;
		let total = 0;
		let openedSize = 0;
		try {
			throwIfAborted(signal, "read");
			const info = await handle.stat();
			throwIfAborted(signal, "read");
			if (!info.isFile()) return null;
			if (info.size >= maxBytes) return null;
			openedSize = info.size;
			buffer = Buffer.allocUnsafe(openedSize + 1);
			while (total < buffer.length) {
				throwIfAborted(signal, "read");
				const length = Math.min(buffer.length - total, DIFF_BASIS_READ_CHUNK_BYTES);
				const { bytesRead } = await handle.read(buffer, total, length, null);
				if (bytesRead === 0) break;
				total += bytesRead;
			}
		} finally {
			await handle.close();
		}
		throwIfAborted(signal, "read");
		if (total !== openedSize) return null;
		const basis = buffer.subarray(0, total);
		if (basis.includes(0)) return null;
		try {
			return normalizeLineEndings(new TextDecoder("utf-8", { fatal: true }).decode(basis));
		} catch (error) {
			/* v8 ignore next 2 -- TextDecoder({fatal}) only throws TypeError on invalid bytes;
			* any other throw is an unreachable runtime fault. */
			if (!(error instanceof TypeError)) throw error;
			return null;
		}
	} catch (error) {
		if (error instanceof FsError) throw error;
		if (error instanceof Error && "code" in error) return null;
		throw error;
	}
}
/**
* Apply a literal replacement to LF-normalized content. Empty or missing search text throws
* `FS_EDIT_NOT_FOUND`; multiple matches throw `FS_AMBIGUOUS_EDIT` unless `replaceAll` is true.
* @param content - the current file content, already LF-normalized.
* @param oldString - literal text to find; CRLF inside it is normalized to LF before
*   matching.
* @param newString - literal replacement text, normalized the same way.
* @param replaceAll - replace every match instead of requiring exactly one.
* @param displayPath - the caller-facing path used in error messages.
* @returns the edited LF-normalized content plus how many occurrences were replaced.
*/
function applyLiteralEdit(content, oldString, newString, replaceAll, displayPath) {
	const oldNorm = normalizeLineEndings(oldString);
	if (oldNorm.length === 0) throw new FsError("old_string must be a non-empty string", "FS_EDIT_NOT_FOUND");
	const newNorm = normalizeLineEndings(newString);
	const replacements = countOccurrences(content, oldNorm);
	if (replacements === 0) throw new FsError(`old_string was not found in "${displayPath}"`, "FS_EDIT_NOT_FOUND");
	if (!replaceAll && replacements > 1) throw new FsError(`old_string matched ${replacements} times in "${displayPath}"; provide a more specific old_string or set replace_all to true`, "FS_AMBIGUOUS_EDIT");
	return {
		content: content.split(oldNorm).join(newNorm),
		replacements
	};
}
/**
* Host-filesystem implementation of `ctx.fs`. Realpath-derived target identity makes aliases
* share stale guards, and writes through a symlink update its target without replacing the link.
* @module @deepseek-ai/dsh-fs-local
*/
const DEFAULT_DIFF_BASIS_MAX_BYTES = 10485760;
const MAX_DIFF_BASIS_BYTES = Math.min(constants.MAX_LENGTH, constants.MAX_STRING_LENGTH);
/**
* The host-filesystem backend. Reads resolve relative paths from {@link Config.cwd}
* (a resolution default, NOT a containment boundary — see the filesystem
* capability-seam Agent Note); enforce
* containment with a stricter backend or a `tools/execute` permission plugin.
*/
var LocalFileSystem = class extends FileSystem {
	static Config = z.object({
		cwd: z.string().default(process.cwd()),
		diffBasisMaxBytes: z.number().default(DEFAULT_DIFF_BASIS_MAX_BYTES)
	});
	/** Validated config (schemastery applied the defaults before construction). */
	config;
	/** Test hook forwarded to fsio for atomic-publication boundaries. */
	internals = {};
	/** Per-targetKey tail promise: serializes mutating ops so the read→guard→write
	* window can't interleave, making concurrent writes/edits deterministically
	* ordered (one wins, the rest see the new version and reject as stale). */
	locks = /* @__PURE__ */ new Map();
	constructor(ctx, config) {
		super(ctx);
		const resolved = config;
		if (!Number.isSafeInteger(resolved.diffBasisMaxBytes) || resolved.diffBasisMaxBytes <= 0 || resolved.diffBasisMaxBytes > MAX_DIFF_BASIS_BYTES) throw new Error(`fs-local: diffBasisMaxBytes must be a positive safe integer no greater than ${MAX_DIFF_BASIS_BYTES}`);
		this.config = resolved;
	}
	/** Run `op` with exclusive access to `targetKey` (FIFO per key). */
	async withLock(targetKey, op) {
		const run = (this.locks.get(targetKey) ?? Promise.resolve()).then(op, op);
		const tail = run.then(() => void 0, () => void 0);
		this.locks.set(targetKey, tail);
		try {
			return await run;
		} finally {
			if (this.locks.get(targetKey) === tail) this.locks.delete(targetKey);
		}
	}
	async resolve(path, opts) {
		if (opts?.signal?.aborted) throw new FsError("resolve aborted", "FS_ABORTED");
		const local = await resolveLocalTarget(opts?.cwd ?? this.config.cwd, path);
		if (opts?.signal?.aborted) throw new FsError("resolve aborted", "FS_ABORTED");
		return {
			targetKey: local.targetKey,
			displayPath: local.displayPath
		};
	}
	processPath(target) {
		return String(target.targetKey);
	}
	fileUrl(target) {
		return pathToFileURL(this.processPath(target)).href;
	}
	contains(parent, child) {
		const path = relative(this.processPath(parent), this.processPath(child));
		return path === "" || path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path);
	}
	async stat(target, signal) {
		if (signal?.aborted) throw new FsError("stat aborted", "FS_ABORTED");
		const info = await probe(target.targetKey);
		if (signal?.aborted) throw new FsError("stat aborted", "FS_ABORTED");
		if (!info) return void 0;
		return {
			version: info.version,
			type: info.type,
			size: info.size
		};
	}
	async lstat(path, opts, signal) {
		if (signal?.aborted) throw new FsError("lstat aborted", "FS_ABORTED");
		if (path.trim().length === 0) throw new FsError("file_path must be a non-empty string", "FS_NOT_FOUND");
		const info = await probeNoFollow(resolve(opts?.cwd ?? this.config.cwd, path));
		if (signal?.aborted) throw new FsError("lstat aborted", "FS_ABORTED");
		if (!info) return void 0;
		return {
			version: info.version,
			type: info.type,
			size: info.size
		};
	}
	async readText(target, signal) {
		return readWholeText({
			displayPath: target.displayPath,
			targetKey: target.targetKey
		}, signal);
	}
	streamText(target, signal) {
		return Promise.resolve(streamWholeText({
			displayPath: target.displayPath,
			targetKey: target.targetKey
		}, signal));
	}
	async listDir(target, signal) {
		return (await listDirectory({
			displayPath: target.displayPath,
			targetKey: target.targetKey
		}, signal)).map((entry) => ({
			name: entry.name,
			type: entry.type,
			target: {
				targetKey: entry.target.targetKey,
				displayPath: entry.target.displayPath
			},
			...entry.version !== void 0 ? { version: entry.version } : {},
			...entry.size !== void 0 ? { size: entry.size } : {}
		}));
	}
	async writeText(target, content, expected, signal) {
		return this.withLock(target.targetKey, async () => {
			const existing = await probe(target.targetKey);
			if (existing && existing.type !== "file") throw new FsError(`cannot write "${target.displayPath}": not a regular file`, "FS_NOT_REGULAR_FILE");
			if (expected?.kind === "replaceIfVersion") {
				if (!existing) throw new FsError(`cannot write "${target.displayPath}": file no longer exists`, "FS_STALE_VERSION");
				if (existing.version !== expected.version) throw new FsError(`cannot write "${target.displayPath}": file changed since it was read`, "FS_STALE_VERSION");
			} else if (expected?.kind === "createIfAbsent" && existing) throw new FsError(`cannot overwrite existing "${target.displayPath}" without reading it first`, "FS_NOT_OBSERVED");
			const before = existing !== null && Buffer.byteLength(content, "utf8") < this.config.diffBasisMaxBytes ? await readTextForDiff(target.targetKey, this.config.diffBasisMaxBytes, signal) : null;
			await writeFileAtomic(target.targetKey, content, existing?.mode, signal, this.internals, expected?.kind === "createIfAbsent" ? { displayPath: target.displayPath } : void 0);
			const after = await probe(target.targetKey);
			return {
				operation: existing ? "update" : "create",
				version: this.versionAfterWrite(after, target),
				before,
				after: normalizeLineEndings(content)
			};
		});
	}
	async editText(target, edit, expected, signal) {
		return this.withLock(target.targetKey, async () => {
			const existing = await probe(target.targetKey);
			if (!existing) throw new FsError(`cannot edit "${target.displayPath}": file changed since it was read`, "FS_STALE_VERSION");
			if (existing.type !== "file") throw new FsError(`cannot edit "${target.displayPath}": not a regular file`, "FS_NOT_REGULAR_FILE");
			if (expected && existing.version !== expected.version) throw new FsError(`cannot edit "${target.displayPath}": file changed since it was read`, "FS_STALE_VERSION");
			const original = await readForEdit(target.targetKey, target.displayPath, signal);
			const edited = applyLiteralEdit(original.content, edit.oldString, edit.newString, edit.replaceAll, target.displayPath);
			const content = restoreLineEndings(edited.content, original.lineEndings);
			await writeFileAtomic(target.targetKey, content, existing.mode, signal, this.internals);
			const after = await probe(target.targetKey);
			return {
				version: this.versionAfterWrite(after, target),
				before: original.content,
				after: edited.content
			};
		});
	}
	/* v8 ignore next 5 -- the post-write probe finding the file absent requires a
	* concurrent unlink between rename and stat; fall back to a sentinel version. */
	versionAfterWrite(after, target) {
		if (after) return after.version;
		return FsVersion(`missing:${target.targetKey}`);
	}
};
//#endregion
//#region src/fs.ts
/**
* The WSL filesystem backend. Identity keys are canonical UNC paths; the
* Linux form is derived on demand, so both worlds stay in sync across
* aliases and symlinks.
*/
var WslFileSystem = class WslFileSystem extends LocalFileSystem {
	static Config = z.object({
		cwd: z.string(),
		distro: z.string(),
		diffBasisMaxBytes: z.number().default(10485760)
	});
	distro;
	executionCwd = new AsyncLocalStorage();
	constructor(ctx, config) {
		super(ctx, config);
		this.distro = config.distro;
		ctx.on("tools/execute", (exec, next) => this.executionCwd.run(exec.agent?.session.header.cwd, next));
		this.internals = {
			linkFile: WslFileSystem.publishNoReplace,
			replaceFile: WslFileSystem.replaceOverWrite,
			copyFileDacl: WslFileSystem.skipDaclCopy
		};
	}
	/**
	* No-replace publication for filesystems without hard links. A real
	* collision (a concurrent external creator won) must still surface as the
	* original EEXIST so the guarded-create failure path classifies it; an
	* absent target falls back to rename, which on Windows publishes without
	* replacing anything. Safe against this backend's own writers because the
	* per-target lock serializes them.
	* @param tempPath - the staged file.
	* @param destPath - the destination to create.
	*/
	static async publishNoReplace(tempPath, destPath) {
		try {
			await link(tempPath, destPath);
			return;
		} catch (error) {
			let exists = false;
			try {
				await lstat(destPath);
				exists = true;
			} catch {}
			if (exists) throw error;
			await rename(tempPath, destPath);
		}
	}
	/**
	* Security-preserving replacement boundary: Windows rename replaces an
	* existing destination atomically; no DACL preservation is needed over 9P.
	* @param destPath - the file being replaced.
	* @param tempPath - the staged replacement.
	*/
	static async replaceOverWrite(destPath, tempPath) {
		await rename(tempPath, destPath);
	}
	/** 9P files inherit their directory's DACL; nothing to preserve. */
	static async skipDaclCopy() {}
	/** Translate a model/plugin path into Windows-side coordinates. */
	translate(path, cwd) {
		const unc = parseWslUnc(path);
		if (unc !== null) return {
			input: joinUnc(unc.distro, unc.linuxPath),
			cwd: this.cwdOr(cwd)
		};
		if (isAbsoluteLinuxPath(path)) {
			const win = mntToWindowsPath(path);
			if (win !== null) return {
				input: win,
				cwd: this.cwdOr(cwd)
			};
			return {
				input: joinUnc(this.distroFor(cwd), path),
				cwd: this.cwdOr(cwd)
			};
		}
		if (windowsToMntPath(path) !== null) return {
			input: path,
			cwd: this.cwdOr(cwd)
		};
		return {
			input: path,
			cwd: this.uncCwd(cwd)
		};
	}
	/** A base for absolute inputs (unused by resolution, but the parent needs one). */
	cwdOr(cwd) {
		return cwd ?? this.executionCwd.getStore() ?? this.config.cwd ?? process.cwd();
	}
	uncCwd(cwd) {
		const base = cwd ?? this.executionCwd.getStore() ?? this.config.cwd;
		if (base === void 0 || base === "") throw new FsError("wsl-fs: no cwd and no configured base for relative resolution", "FS_IO_ERROR");
		const unc = parseWslUnc(base);
		if (unc !== null) return joinUnc(unc.distro, unc.linuxPath);
		if (isAbsoluteLinuxPath(base)) return joinUnc(this.distroFor(base), base);
		if (windowsToMntPath(base) !== null) return base;
		throw new FsError(`wsl-fs: cwd "${base}" is not in the WSL execution world`, "FS_IO_ERROR");
	}
	/**
	* Resolve the distribution an absolute Linux path opens inside. The chain:
	* the caller cwd when it is a WSL UNC path, then the current tool
	* execution's session cwd, then the configured `distro`,
	* then the host's default distribution from the Lxss registry. The registry
	* fallback is reserved for calls that genuinely have no session.
	*/
	distroFor(cwd) {
		const fromCwd = parseWslUnc(cwd ?? "");
		if (fromCwd !== null) return fromCwd.distro;
		const fromExecution = parseWslUnc(this.executionCwd.getStore() ?? "");
		if (fromExecution !== null) return fromExecution.distro;
		const distro = this.distro;
		if (distro !== void 0 && distro !== "") return distro;
		const fallback = defaultDistroSync();
		if (fallback !== void 0) return fallback;
		throw new FsError("wsl-fs: Linux path carries no distribution and none is configured", "FS_IO_ERROR");
	}
	/** The Linux display path for a resolved Windows-side path. */
	linuxDisplay(raw) {
		const unc = parseWslUnc(raw);
		if (unc !== null) return unc.linuxPath;
		const mnt = windowsToMntPath(raw);
		if (mnt !== null) return mnt;
		throw new FsError(`wsl-fs: resolved path "${raw}" is outside the WSL execution world`, "FS_IO_ERROR");
	}
	async resolve(path, opts) {
		if (opts?.signal?.aborted) throw new FsError("resolve aborted", "FS_ABORTED");
		const { input, cwd } = this.translate(path, opts?.cwd);
		const local = await super.resolve(input, {
			cwd,
			...opts?.signal !== void 0 ? { signal: opts.signal } : {}
		});
		return {
			targetKey: local.targetKey,
			displayPath: this.linuxDisplay(String(local.displayPath))
		};
	}
	processPath(target) {
		const key = String(target.targetKey);
		const unc = parseWslUnc(key);
		if (unc !== null) return unc.linuxPath;
		const mnt = windowsToMntPath(key);
		if (mnt !== null) return mnt;
		throw new FsError(`wsl-fs: target "${target.displayPath}" is outside the WSL execution world`, "FS_IO_ERROR");
	}
	fileUrl(target) {
		return `file://${this.processPath(target).split("/").map(encodeURIComponent).join("/")}`;
	}
	contains(parent, child) {
		const parentWorld = this.worldPath(parent);
		const childWorld = this.worldPath(child);
		if (parentWorld.distro !== childWorld.distro) return false;
		const parentPath = parentWorld.linuxPath;
		const childPath = childWorld.linuxPath;
		if (childPath === parentPath) return true;
		return parentPath === "/" ? true : childPath.startsWith(`${parentPath}/`);
	}
	/** One target's (distro, linuxPath) pair for containment; `undefined` distro = Windows world. */
	worldPath(target) {
		const key = String(target.targetKey);
		const unc = parseWslUnc(key);
		if (unc !== null) return {
			distro: unc.distro,
			linuxPath: unc.linuxPath
		};
		const mnt = windowsToMntPath(key);
		if (mnt !== null) return {
			distro: void 0,
			linuxPath: mnt
		};
		throw new FsError(`wsl-fs: target "${target.displayPath}" is outside the WSL execution world`, "FS_IO_ERROR");
	}
	async lstat(path, opts, signal) {
		if (signal?.aborted) throw new FsError("lstat aborted", "FS_ABORTED");
		if (path.trim().length === 0) throw new FsError("file_path must be a non-empty string", "FS_NOT_FOUND");
		const { input, cwd } = this.translate(path, opts?.cwd);
		return super.lstat(input, { cwd }, signal);
	}
};
//#endregion
export { WslFileSystem, WslFileSystem as default };

//# sourceMappingURL=fs.js.map