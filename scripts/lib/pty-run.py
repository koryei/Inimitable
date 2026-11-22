#!/usr/bin/env python3
"""Run a command in a real pseudo-terminal of a given size and write everything it prints to stdout.

usage: pty-run.py COLS ROWS TIMEOUT_MS KEYS_WAIT_MS KEYS -- command [args...]

Used by term-shot.mjs. Python 3 is on macOS and nearly every Linux; Windows needs WSL.
Exit code: the command's, 124 on timeout.
"""
import fcntl
import os
import pty
import select
import signal
import struct
import sys
import termios
import time


def main():
    sep = sys.argv.index("--")
    cols, rows, timeout_ms, keys_wait_ms = (int(v) for v in sys.argv[1:5])
    keys = sys.argv[5].encode().decode("unicode_escape").encode() if sys.argv[5] else b""
    command = sys.argv[sep + 1:]

    pid, fd = pty.fork()
    if pid == 0:
        os.execvp(command[0], command)
    fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))
    os.kill(pid, signal.SIGWINCH)

    start = time.time()
    sent = not keys
    status = None
    while True:
        elapsed_ms = (time.time() - start) * 1000
        if not sent and elapsed_ms >= keys_wait_ms:
            os.write(fd, keys)
            sent = True
        if elapsed_ms >= timeout_ms:
            os.kill(pid, signal.SIGKILL)
            os.waitpid(pid, 0)
            sys.stdout.flush()
            sys.exit(124)
        ready, _, _ = select.select([fd], [], [], 0.05)
        if ready:
            try:
                data = os.read(fd, 65536)
            except OSError:
                data = b""
            if not data:
                break
            sys.stdout.buffer.write(data)
            sys.stdout.buffer.flush()
        else:
            done, st = os.waitpid(pid, os.WNOHANG)
            if done:
                status = st
                # drain what is left
                try:
                    while select.select([fd], [], [], 0.05)[0]:
                        data = os.read(fd, 65536)
                        if not data:
                            break
                        sys.stdout.buffer.write(data)
                except OSError:
                    pass
                break
    if status is None:
        _, status = os.waitpid(pid, 0)
    sys.exit(os.waitstatus_to_exitcode(status))


main()
