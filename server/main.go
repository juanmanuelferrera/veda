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

	// Open browser after 1 second
	go func() {
		time.Sleep(1 * time.Second)
		url := fmt.Sprintf("http://localhost:%s", port)
		switch runtime.GOOS {
		case "linux":
			exec.Command("xdg-open", url).Start()
		case "darwin":
			exec.Command("open", url).Start()
		case "windows":
			exec.Command("cmd", "/c", "start", url).Start()
		}
	}()

	http.Handle("/", http.FileServer(http.Dir(dir)))
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}
