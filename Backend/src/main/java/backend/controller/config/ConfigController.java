package backend.controller.config;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.service.config.ConfigService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigService configService;

    @GetMapping("/banco")
    public String getCaminho() {
        return configService.getDbPath();
    }

    @PostMapping("/banco")
    public void salvarCaminho(@RequestBody String novoCaminho) throws Exception {
        configService.saveDbPath(novoCaminho);
    }
}