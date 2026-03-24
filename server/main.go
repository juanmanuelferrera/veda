package main

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"
)

func main() {
	// Find web/public relative to the executable
	exe, _ := os.Executable()
	exeDir := filepath.Dir(exe)

	// Try multiple paths to find web/public
	candidates := []string{
		filepath.Join(exeDir, "web", "public"),
		filepath.Join(exeDir, "..", "web", "public"),
		filepath.Join(".", "web", "public"),
	}

	var dir string
	for _, c := range candidates {
		if info, err := os.Stat(c); err == nil && info.IsDir() {
			dir = c
			break
		}
	}

	if dir == "" {
		fmt.Println("Error: web/public directory not found")
		os.Exit(1)
	}

	port := "8080"
	if len(os.Args) > 1 {
		port = os.Args[1]
	}

	fmt.Println("==============================")
	fmt.Println("  V.E.D.A.")
	fmt.Println("  Vedic Education & Data Archive")
	fmt.Println("==============================")
	fmt.Println()
	fmt.Printf("  http://localhost:%s\n", port)
	fmt.Println()

	// Open browser in app mode after 1 second
	go func() {
		time.Sleep(1 * time.Second)
		url := fmt.Sprintf("http://localhost:%s", port)
		appURL := fmt.Sprintf("--app=%s", url)
		switch runtime.GOOS {
		case "linux":
			if err := exec.Command("google-chrome", appURL).Start(); err != nil {
				if err := exec.Command("chromium-browser", appURL).Start(); err != nil {
					exec.Command("xdg-open", url).Start()
				}
			}
		case "darwin":
			if err := exec.Command("open", "-na", "Google Chrome", "--args", appURL).Start(); err != nil {
				exec.Command("open", url).Start()
			}
		case "windows":
			if err := exec.Command("cmd", "/c", "start", "chrome", appURL).Start(); err != nil {
				if err := exec.Command("cmd", "/c", "start", "msedge", appURL).Start(); err != nil {
					exec.Command("cmd", "/c", "start", url).Start()
				}
			}
		}
	}()

	http.Handle("/", http.FileServer(http.Dir(dir)))
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}
