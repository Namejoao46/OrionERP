package backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.service.ConfigService;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Autowired
    private ConfigService configService;

    @GetMapping("/banco")
    public String getCaminho() {
        return configService.getDbPath();
    }

    @PostMapping("/banco")
    public void salvarCaminho(@RequestBody String novoCaminho) throws Exception {
        configService.saveDbPath(novoCaminho);
    }
}