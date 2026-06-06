package backend.service.config;

import java.io.IOException; 
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import backend.model.auth.Colaborador;
import backend.model.auth.UserRole;
import backend.model.gestao.Empresa;
import backend.repository.auth.ColaboradorRepository;
import backend.repository.gestao.EmpresaRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ColaboradorRepository repository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // 1. Criar Empresa OrionERP se não existir
        // Usando o campo correto: nomeFantasia
        Empresa orion = empresaRepository.findByNomeFantasia("OrionERP").orElse(null);
        if (orion == null) {
            orion = new Empresa();
            orion.setNomeFantasia("OrionERP"); // Campo correto
            orion.setCnpj("00.000.000/0001-00");
            orion.setPlano("Premium");
            orion = empresaRepository.save(orion);
            System.out.println(">>> Empresa OrionERP criada com sucesso.");
        }

        // 2. Criar Admin 1
        if (repository.findByLogin("admin").isEmpty()) {
            Colaborador admin = new Colaborador();
            preencherDadosBase(admin, "admin", "123", "Leandro", "ORION-001", orion);
            carregarFoto(admin, "images/admin1.jpeg");
            repository.save(admin);
        }

        // 3. Criar Admin 2
        if (repository.findByLogin("admin2").isEmpty()) {
            Colaborador jp = new Colaborador();
            preencherDadosBase(jp, "admin2", "456", "João Paulo", "ORION-002", orion);
            carregarFoto(jp, "images/admin2.jpg");
            repository.save(jp);
        }
    }

    private void preencherDadosBase(Colaborador c, String login, String senha, String nome, String mat, Empresa empresa) {
        c.setLogin(login);
        c.setSenha(passwordEncoder.encode(senha));
        c.setRole(UserRole.ADMIN_DEV);
        c.setNome(nome);
        c.setMatricula(mat);
        c.setCargo("Administrador");
        c.setTipoColaborador("FULLSTACK");
        c.setDataNascimento(LocalDate.of(2000, 1, 1));
        c.setEmpresa(empresa);
    }

    private void carregarFoto(Colaborador c, @NonNull String path) {
        try {
            byte[] foto = new ClassPathResource(path).getInputStream().readAllBytes();
            c.setFoto(foto);
        } catch (IOException | IllegalArgumentException e) {
            System.out.println(">>> Aviso: Foto não encontrada em " + path);
        }
    }
}